// migrations/20250324D_create_schools_educational_paths.js

export async function up(knex) {
  // Create the junction table for many-to-many relationship between schools and educational paths
  await knex.schema.createTable("schools_educational_paths", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("schools_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table
      .uuid("educational_paths_id")
      .references("id")
      .inTable("educational_paths")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");

    // Add a unique constraint to prevent duplicate relationships
    table.unique(["schools_id", "educational_paths_id"]);
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "schools_educational_paths",
    icon: "import_export",
    note: "Junction table between schools and their educational paths",
    hidden: true,
    singleton: false,
    sort_field: null,
  });

  // Add fields to Directus
  await knex("directus_fields").insert([
    {
      collection: "schools_educational_paths",
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
      collection: "schools_educational_paths",
      field: "schools_id",
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
      sort: 2,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "schools_educational_paths",
      field: "educational_paths_id",
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
      note: null,
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "schools_educational_paths",
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
      collection: "schools_educational_paths",
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
      collection: "schools_educational_paths",
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
      collection: "schools_educational_paths",
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

  // Create the M2M relationship in schools
  await knex("directus_fields").insert({
    collection: "schools",
    field: "educational_paths",
    special: ["m2m"],
    interface: "list-m2m",
    options: {
      template: "{{educational_paths_id.name}}",
      enableCreate: false,
    },
    display: "related-values",
    display_options: {
      template: "{{educational_paths_id.name}}",
    },
    readonly: false,
    hidden: false,
    sort: 8,
    width: "full",
    translations: null,
    note: "Educational paths offered by this school",
    conditions: null,
    required: false,
    group: null,
  });

  // Create the M2M relationship in educational_paths
  await knex("directus_fields").insert({
    collection: "educational_paths",
    field: "schools",
    special: ["m2m"],
    interface: "list-m2m",
    options: {
      template: "{{schools_id.name}}",
      enableCreate: false,
    },
    display: "related-values",
    display_options: {
      template: "{{schools_id.name}}",
    },
    readonly: false,
    hidden: false,
    sort: 9,
    width: "full",
    translations: null,
    note: "Schools offering this educational path",
    conditions: null,
    required: false,
    group: null,
  });

  // Create the relational field configuration
  await knex("directus_relations").insert([
    {
      many_collection: "schools_educational_paths",
      many_field: "schools_id",
      one_collection: "schools",
      one_field: "educational_paths",
      junction_field: "educational_paths_id",
    },
    {
      many_collection: "schools_educational_paths",
      many_field: "educational_paths_id",
      one_collection: "educational_paths",
      one_field: "schools",
      junction_field: "schools_id",
    },
  ]);
}

export async function down(knex) {
  // Remove the relations
  await knex("directus_relations")
    .where({
      many_collection: "schools_educational_paths",
      many_field: "schools_id",
    })
    .orWhere({
      many_collection: "schools_educational_paths",
      many_field: "educational_paths_id",
    })
    .delete();

  // Remove the M2M fields
  await knex("directus_fields")
    .where({
      collection: "schools",
      field: "educational_paths",
    })
    .orWhere({
      collection: "educational_paths",
      field: "schools",
    })
    .delete();

  // Remove the fields from Directus
  await knex("directus_fields")
    .where("collection", "schools_educational_paths")
    .delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "schools_educational_paths")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("schools_educational_paths");
}
