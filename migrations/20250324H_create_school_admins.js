// migrations/20250324H_create_school_admins.js

export async function up(knex) {
  // Create the school_admins table to link Directus users to schools
  await knex.schema.createTable("school_admins", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("directus_user_id")
      .references("id")
      .inTable("directus_users")
      .onDelete("CASCADE");
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");

    // Add a unique constraint to prevent duplicate assignments
    table.unique(["directus_user_id", "school_id"]);
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "school_admins",
    icon: "admin_panel_settings",
    note: "Links users to schools for admin permissions",
    display_template: "{{directus_user_id.email}} - {{school_id.name}}",
    archive_field: null,
    archive_app_filter: true,
    archive_value: null,
    unarchive_value: null,
    singleton: false,
    sort_field: null,
  });

  // Add fields to Directus
  await knex("directus_fields").insert([
    {
      collection: "school_admins",
      field: "id",
      special: ["uuid"],
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: true,
      hidden: true,
      sort: 1,
      width: "full",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "school_admins",
      field: "directus_user_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{email}}",
        filter: {
          status: {
            _eq: "active",
          },
        },
      },
      display: "related-values",
      display_options: {
        template: "{{email}}",
      },
      readonly: false,
      hidden: false,
      sort: 2,
      width: "half",
      translations: null,
      note: "Directus user to be given school admin privileges",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "school_admins",
      field: "school_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
      },
      display: "related-values",
      display_options: {
        template: "{{name}}",
      },
      readonly: false,
      hidden: false,
      sort: 3,
      width: "half",
      translations: null,
      note: "School to be managed by this user",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "school_admins",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 4,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "school_admins",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 5,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "school_admins",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 6,
      width: "half",
      required: false,
    },
    {
      collection: "school_admins",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 7,
      width: "half",
      required: false,
    },
  ]);

  // Add relations to Directus
  await knex("directus_relations").insert([
    {
      many_collection: "school_admins",
      many_field: "directus_user_id",
      one_collection: "directus_users",
      one_field: null,
    },
    {
      many_collection: "school_admins",
      many_field: "school_id",
      one_collection: "schools",
      one_field: null,
    },
  ]);


  // Add the reverse O2M field 'school_admins' to the 'schools' collection fields
  await knex("directus_fields").insert({
    collection: "schools", // Target the schools collection
    field: "school_admins", // Name of the new O2M field
    special: JSON.stringify(["o2m"]), // Specify it's an O2M relationship
    interface: "list-o2m", // Standard interface for O2M
    options: JSON.stringify({
      // Optional: Customize how the related items are displayed
      template: "{{directus_user_id.email}}",
      // Optional: Add filters, enable creation/selection from the schools item page
      // filter: { status: { _eq: 'active' } },
      // enableCreate: false,
      // enableSelect: true,
    }),
    display: "related-values",
    display_options: JSON.stringify({
      // Optional: Customize display in list views
      template: "{{directus_user_id.email}}",
    }),
    readonly: false,
    hidden: false, // Make it visible in the UI if desired
    sort: 26, // Choose an appropriate sort order relative to other fields in 'schools'
    width: "full",
    translations: null,
    note: "Administrators linked to this school",
    conditions: null,
    required: false,
    group: null,
  });

  // Update the 'directus_relations' entries to include the reverse field info
  // Find the existing M2O relation from school_admins to schools
  const relationToUpdate = await knex("directus_relations")
      .where({
          many_collection: "school_admins",
          many_field: "school_id",
          one_collection: "schools",
          // one_field was null previously
      })
      .first();

  if (relationToUpdate) {
      // Update the existing relation to specify the 'one_field'
      await knex("directus_relations")
          .where({ id: relationToUpdate.id }) // Use the specific ID if possible, otherwise the query above
          .update({
              one_field: "school_admins", // Set the name of the O2M field on the 'schools' side
          });
      console.log("Updated directus_relations for school_admins -> schools.");

      // Ensure the other relation (school_admins -> directus_users) is still correct
      // Check if it exists before inserting
      const userRelationExists = await knex("directus_relations")
        .where({
          many_collection: "school_admins",
          many_field: "directus_user_id",
        })
        .first();

      if (!userRelationExists) {
        await knex("directus_relations").insert({
          many_collection: "school_admins",
          many_field: "directus_user_id",
          one_collection: "directus_users",
          one_field: null, // Assuming no reverse field needed on directus_users
          junction_field: null, // Not a junction table field
        });
        console.log("Inserted missing directus_relations for school_admins -> directus_users.");
      }

  } else {
      // If the relation wasn't found (unexpected), insert both correctly
      console.warn("Could not find existing relation school_admins -> schools to update. Inserting new relation entries.");

      // Check and insert schools relation
      const schoolRelationExists = await knex("directus_relations")
        .where({
          many_collection: "school_admins",
          many_field: "school_id",
        })
        .first();
      if (!schoolRelationExists) {
        await knex("directus_relations").insert({
            many_collection: "school_admins",
            many_field: "school_id",
            one_collection: "schools",
            one_field: "school_admins", // The reverse field on 'schools'
            junction_field: null, // Not a junction table field
        });
         console.log("Inserted directus_relations for school_admins -> schools.");
      }

      // Check and insert users relation
      const userRelationExists = await knex("directus_relations")
        .where({
          many_collection: "school_admins",
          many_field: "directus_user_id",
        })
        .first();

       if (!userRelationExists) {
        await knex("directus_relations").insert({
            many_collection: "school_admins",
            many_field: "directus_user_id",
            one_collection: "directus_users",
            one_field: null, // Assuming no reverse field needed on directus_users
            junction_field: null, // Not a junction table field
        });
        console.log("Inserted directus_relations for school_admins -> directus_users.");
      }
  }

}


export async function down(knex) {
  // Remove the reverse O2M field from 'schools' collection
  await knex("directus_fields")
    .where({
      collection: "schools",
      field: "school_admins",
    })
    .delete();

  // Revert the 'directus_relations' update if needed (set one_field back to null or delete/re-insert)
  // Safest might be to ensure the relation exists with one_field as null
   await knex("directus_relations")
          .where({
              many_collection: "school_admins",
              many_field: "school_id",
              one_collection: "schools",
          })
          .update({
              one_field: null, // Set it back to null
          });


  // Remove the relations
  await knex("directus_relations")
    .where({
      many_collection: "school_admins",
      many_field: "directus_user_id",
    })
    .orWhere({
      many_collection: "school_admins",
      many_field: "school_id",
    })
    .delete();

  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "school_admins").delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "school_admins")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("school_admins");
}
