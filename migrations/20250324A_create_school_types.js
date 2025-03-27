// migrations/20250324A_create_school_types.js

export async function up(knex) {
  // Create the school_types table
  await knex.schema.createTable("school_types", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "school_types",
    icon: "category",
    note: "Types of schools (Liceo, Istituto Tecnico, etc.)",
    display_template: "{{name}}",
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
      collection: "school_types",
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
      collection: "school_types",
      field: "name",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 2,
      width: "full",
      translations: null,
      note: "Name of the school type",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "school_types",
      field: "description",
      special: null,
      interface: "input-multiline",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 3,
      width: "full",
      translations: null,
      note: "Description of this school type",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "school_types",
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
      collection: "school_types",
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
      collection: "school_types",
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
      collection: "school_types",
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

  // Pre-populate with standard school types in Italy
  await knex("school_types").insert([
    {
      name: "Liceo",
      description:
        "Percorso di studi di carattere prevalentemente teorico e propedeutico alla formazione universitaria",
    },
    {
      name: "Istituto Tecnico",
      description:
        "Percorso di studi che unisce teoria e pratica con specializzazioni tecniche",
    },
    {
      name: "Istituto Professionale",
      description:
        "Percorso di studi orientato all'acquisizione di competenze pratiche per l'inserimento nel mondo del lavoro",
    },
    {
      name: "Scuola Professionale",
      description:
        "Formazione professionale con focus sulle competenze pratiche e stage in azienda",
    },
  ]);
}

export async function down(knex) {
  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "school_types").delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "school_types")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("school_types");
}
