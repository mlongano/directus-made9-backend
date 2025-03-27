// migrations/20250324K_update_schema_for_rovereto_schools.js

export async function up(knex) {
  // 1. Add MIUR code and orientation manager to schools
  await knex.schema.alterTable("schools", (table) => {
    table.string("miur_code").unique().after("name");
    table.string("responsabile_orientamento").after("address");
  });

  // 2. Create contacts table for emails
  await knex.schema.createTable("school_emails", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.string("description").notNullable();
    table.string("email").notNullable();
    table.integer("sort").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // 3. Create contacts table for phones
  await knex.schema.createTable("school_phones", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.string("description").notNullable();
    table.string("number").notNullable();
    table.integer("sort").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // 4. Create a table for educational path links (detailed page links for each path in each school)
  await knex.schema.createTable("school_educational_path_links", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table
      .uuid("educational_path_id")
      .references("id")
      .inTable("educational_paths")
      .onDelete("CASCADE");
    table.string("link_url");
    table.integer("sort").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");

    // Add a unique constraint to prevent duplicate relationships
    table.unique(["school_id", "educational_path_id"]);
  });

  // 5. Update events table to link to specific campus/branch using MIUR code
  await knex.schema.alterTable("events", (table) => {
    table.string("miur_code").after("id");
    table.dropColumn("school_id"); // Remove the original foreign key as we'll link by MIUR code
  });

  // 6. Register new collections in Directus
  await knex("directus_collections").insert([
    {
      collection: "school_emails",
      icon: "mail",
      note: "Email contacts for schools",
      display_template: "{{description}}: {{email}}",
      archive_field: null,
      archive_app_filter: true,
      archive_value: null,
      unarchive_value: null,
      singleton: false,
      sort_field: "sort",
      accountability: "all",
      group: null,
    },
    {
      collection: "school_phones",
      icon: "phone",
      note: "Phone contacts for schools",
      display_template: "{{description}}: {{number}}",
      archive_field: null,
      archive_app_filter: true,
      archive_value: null,
      unarchive_value: null,
      singleton: false,
      sort_field: "sort",
      accountability: "all",
      group: null,
    },
    {
      collection: "school_educational_path_links",
      icon: "link",
      note: "Links to detailed information about educational paths at specific schools",
      display_template: "{{educational_path_id.name}} at {{school_id.name}}",
      archive_field: null,
      archive_app_filter: true,
      archive_value: null,
      unarchive_value: null,
      singleton: false,
      sort_field: "sort",
      accountability: "all",
      group: null,
      hidden: true,
    },
  ]);

  // 7. Add fields to Directus for school emails
  await knex("directus_fields").insert([
    {
      collection: "school_emails",
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
      required: false,
      group: null,
    },
    {
      collection: "school_emails",
      field: "school_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
      },
      display: "related-values",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 2,
      width: "half",
      required: true,
      group: null,
    },
    {
      collection: "school_emails",
      field: "description",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 3,
      width: "half",
      required: true,
      group: null,
      note: "Type of email (e.g. orientamento, segreteria, etc.)",
    },
    {
      collection: "school_emails",
      field: "email",
      special: null,
      interface: "input",
      options: {
        placeholder: "example@school.it",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      required: true,
      group: null,
    },
    {
      collection: "school_emails",
      field: "sort",
      special: ["sort"],
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: true,
      sort: 5,
      width: "full",
      required: false,
      group: null,
    },
    {
      collection: "school_emails",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 6,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_emails",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 7,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_emails",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 8,
      width: "half",
      required: false,
    },
    {
      collection: "school_emails",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 9,
      width: "half",
      required: false,
    },
  ]);

  // 8. Add fields to Directus for school phones
  await knex("directus_fields").insert([
    {
      collection: "school_phones",
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
      required: false,
      group: null,
    },
    {
      collection: "school_phones",
      field: "school_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
      },
      display: "related-values",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 2,
      width: "half",
      required: true,
      group: null,
    },
    {
      collection: "school_phones",
      field: "description",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 3,
      width: "half",
      required: true,
      group: null,
      note: "Type of phone (e.g. telefono, fax, etc.)",
    },
    {
      collection: "school_phones",
      field: "number",
      special: null,
      interface: "input",
      options: {
        placeholder: "+39 0464 123456",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      required: true,
      group: null,
    },
    {
      collection: "school_phones",
      field: "sort",
      special: ["sort"],
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: true,
      sort: 5,
      width: "full",
      required: false,
      group: null,
    },
    {
      collection: "school_phones",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 6,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_phones",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 7,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_phones",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 8,
      width: "half",
      required: false,
    },
    {
      collection: "school_phones",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 9,
      width: "half",
      required: false,
    },
  ]);

  // 9. Add fields to Directus for school educational path links
  await knex("directus_fields").insert([
    {
      collection: "school_educational_path_links",
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
      required: false,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "school_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
      },
      display: "related-values",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 2,
      width: "half",
      required: true,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "educational_path_id",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
      },
      display: "related-values",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 3,
      width: "half",
      required: true,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "link_url",
      special: null,
      interface: "input",
      options: {
        placeholder: "https://www.school.it/path",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      required: false,
      group: null,
      note: "URL to detailed information about this path at this school",
    },
    {
      collection: "school_educational_path_links",
      field: "sort",
      special: ["sort"],
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: true,
      sort: 5,
      width: "full",
      required: false,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 6,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 7,
      width: "half",
      required: false,
      group: null,
    },
    {
      collection: "school_educational_path_links",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 8,
      width: "half",
      required: false,
    },
    {
      collection: "school_educational_path_links",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 9,
      width: "half",
      required: false,
    },
  ]);

  // 10. Add the relationship fields to the schools collection
  await knex("directus_fields").insert([
    {
      collection: "schools",
      field: "emails",
      special: ["o2m"],
      interface: "list-o2m",
      options: {
        template: "{{description}}: {{email}}",
        enableCreate: true,
        enableSelect: true,
      },
      display: "related-values",
      display_options: {
        template: "{{description}}: {{email}}",
      },
      readonly: false,
      hidden: false,
      sort: 23,
      width: "full",
      translations: null,
      note: "Email contacts for this school",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "phones",
      special: ["o2m"],
      interface: "list-o2m",
      options: {
        template: "{{description}}: {{number}}",
        enableCreate: true,
        enableSelect: true,
      },
      display: "related-values",
      display_options: {
        template: "{{description}}: {{number}}",
      },
      readonly: false,
      hidden: false,
      sort: 24,
      width: "full",
      translations: null,
      note: "Phone contacts for this school",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "path_links",
      special: ["o2m"],
      interface: "list-o2m",
      options: {
        template: "{{educational_path_id.name}}: {{link_url}}",
        enableCreate: true,
        enableSelect: true,
      },
      display: "related-values",
      display_options: {
        template: "{{educational_path_id.name}}: {{link_url}}",
      },
      readonly: false,
      hidden: false,
      sort: 25,
      width: "full",
      translations: null,
      note: "Links to detailed information about educational paths at this school",
      conditions: null,
      required: false,
      group: null,
    },
  ]);

  // 11. Add relations
  await knex("directus_relations").insert([
    {
      many_collection: "school_emails",
      many_field: "school_id",
      one_collection: "schools",
      one_field: "emails",
    },
    {
      many_collection: "school_phones",
      many_field: "school_id",
      one_collection: "schools",
      one_field: "phones",
    },
    {
      many_collection: "school_educational_path_links",
      many_field: "school_id",
      one_collection: "schools",
      one_field: "path_links",
    },
    {
      many_collection: "school_educational_path_links",
      many_field: "educational_path_id",
      one_collection: "educational_paths",
      one_field: null,
    },
  ]);
}

export async function down(knex) {
  // Remove the relations
  await knex("directus_relations")
    .where({
      many_collection: "school_emails",
      many_field: "school_id",
    })
    .orWhere({
      many_collection: "school_phones",
      many_field: "school_id",
    })
    .orWhere({
      many_collection: "school_educational_path_links",
      many_field: "school_id",
    })
    .orWhere({
      many_collection: "school_educational_path_links",
      many_field: "educational_path_id",
    })
    .delete();

  // Remove the fields from schools collection
  await knex("directus_fields")
    .where({
      collection: "schools",
      field: "emails",
    })
    .orWhere({
      collection: "schools",
      field: "phones",
    })
    .orWhere({
      collection: "schools",
      field: "path_links",
    })
    .delete();

  // Remove the fields from Directus collections
  await knex("directus_fields").where("collection", "school_emails").delete();
  await knex("directus_fields").where("collection", "school_phones").delete();
  await knex("directus_fields")
    .where("collection", "school_educational_path_links")
    .delete();

  // Remove the collections from Directus
  await knex("directus_collections")
    .where("collection", "school_emails")
    .delete();
  await knex("directus_collections")
    .where("collection", "school_phones")
    .delete();
  await knex("directus_collections")
    .where("collection", "school_educational_path_links")
    .delete();

  // Drop the tables
  await knex.schema.dropTableIfExists("school_emails");
  await knex.schema.dropTableIfExists("school_phones");
  await knex.schema.dropTableIfExists("school_educational_path_links");

  // Restore original events schema
  await knex.schema.alterTable("events", (table) => {
    table.uuid("school_id").references("id").inTable("schools");
    table.dropColumn("miur_code");
  });

  // Remove the added fields from schools
  await knex.schema.alterTable("schools", (table) => {
    table.dropColumn("miur_code");
    table.dropColumn("responsabile_orientamento");
  });
}
