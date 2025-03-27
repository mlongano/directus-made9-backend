// migrations/20250324B_create_educational_paths.js

export async function up(knex) {
  // Create the educational_paths table
  await knex.schema.createTable("educational_paths", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.text("description");
    table.text("details");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "educational_paths",
    icon: "map",
    note: "Educational paths offered by schools (indirizzo linguistico, indirizzo classico, etc.)",
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
      collection: "educational_paths",
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
      collection: "educational_paths",
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
      note: "Name of the educational path",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "educational_paths",
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
      note: "Short description of this educational path",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "educational_paths",
      field: "details",
      special: ["wysiwyg"],
      interface: "input-rich-text-html",
      options: {
        toolbar: [
          "bold",
          "italic",
          "underline",
          "removeformat",
          "bullist",
          "numlist",
          "blockquote",
          "h1",
          "h2",
          "h3",
          "image",
          "link",
          "table",
        ],
      },
      display: "formatted-value",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      translations: null,
      note: "Detailed information about this educational path",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "educational_paths",
      field: "created_at",
      special: ["date-created"],
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
      collection: "educational_paths",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 6,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "educational_paths",
      field: "user_created",
      special: ["user-created"],
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
    {
      collection: "educational_paths",
      field: "user_updated",
      special: ["user-updated"],
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
  ]);

  // Pre-populate with common educational paths in Italy
  await knex("educational_paths").insert([
    {
      name: "Classico",
      description:
        "Percorso con focus su lingue classiche, letteratura e filosofia",
    },
    {
      name: "Scientifico",
      description:
        "Percorso con focus su matematica, fisica e scienze naturali",
    },
    {
      name: "Linguistico",
      description:
        "Percorso con focus sull'apprendimento delle lingue straniere",
    },
    {
      name: "Scienze Umane",
      description:
        "Percorso con focus su psicologia, pedagogia e scienze sociali",
    },
    {
      name: "Artistico",
      description:
        "Percorso con focus su discipline artistiche e storia dell'arte",
    },
    {
      name: "Musicale",
      description: "Percorso con focus sulla formazione musicale",
    },
    {
      name: "Tecnologico",
      description: "Percorso con focus su informatica e tecnologie",
    },
    {
      name: "Economico",
      description: "Percorso con focus su economia, diritto e finanza",
    },
    {
      name: "Alberghiero",
      description: "Percorso con focus su gastronomia, ospitalità e turismo",
    },
    {
      name: "Industriale",
      description: "Percorso con focus su meccanica, elettronica e automazione",
    },
  ]);
}

export async function down(knex) {
  // Remove the fields from Directus
  await knex("directus_fields")
    .where("collection", "educational_paths")
    .delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "educational_paths")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("educational_paths");
}
