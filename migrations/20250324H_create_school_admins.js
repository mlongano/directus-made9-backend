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
}

export async function down(knex) {
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
