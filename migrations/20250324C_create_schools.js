// migrations/20250324C_create_schools.js

export async function up(knex) {
  // Create the schools table
  await knex.schema.createTable("schools", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.uuid("type").references("id").inTable("school_types");
    table.uuid("logo").references("id").inTable("directus_files");
    table.string("website_url");
    table.text("description");
    table.text("detailed_info", "longtext");
    table.string("address");
    table.json("geo_location");
    table.boolean("main_campus").defaultTo(true);
    table.uuid("parent_school").references("id").inTable("schools").nullable();
    table.boolean("canteen").defaultTo(false);
    table.boolean("boarding").defaultTo(false);
    table.string("email");
    table.string("phone");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "schools",
    icon: "school",
    note: "Schools participating in the orientation program",
    display_template: "{{name}}",
    archive_field: null,
    archive_app_filter: true,
    archive_value: null,
    unarchive_value: null,
    singleton: false,
    sort_field: null,
    accountability: "all",
    group: null,
  });

  // Add fields to Directus
  await knex("directus_fields").insert([
    {
      collection: "schools",
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
      collection: "schools",
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
      note: "Full name of the school",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "schools",
      field: "type",
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
      width: "full",
      translations: null,
      note: "Type of school",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "schools",
      field: "logo",
      special: ["file"],
      interface: "file-image",
      options: {
        crop: false,
      },
      display: "image",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "half",
      translations: null,
      note: "School logo",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "website_url",
      special: null,
      interface: "input",
      options: {
        placeholder: "https://www.example.com",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 5,
      width: "half",
      translations: null,
      note: "Official school website URL",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "description",
      special: null,
      interface: "input-multiline",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 6,
      width: "full",
      translations: null,
      note: "Brief description of the school",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "detailed_info",
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
      sort: 7,
      width: "full",
      translations: null,
      note: "Detailed information about the school",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "address",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 8,
      width: "full",
      translations: null,
      note: "Physical address of the school",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "geo_location",
      special: ["json"],
      interface: "input-map",
      options: {
        geometryType: "Point",
      },
      display: "map",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 9,
      width: "full",
      translations: null,
      note: "Geographic coordinates for map display",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "main_campus",
      special: ["boolean"],
      interface: "boolean",
      options: null,
      display: "boolean",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 10,
      width: "half",
      translations: null,
      note: "Is this the main campus?",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "parent_school",
      special: ["m2o"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{name}}",
        filter: {
          main_campus: {
            _eq: true,
          },
        },
      },
      display: "related-values",
      display_options: {
        template: "{{name}}",
      },
      readonly: false,
      hidden: false,
      sort: 11,
      width: "half",
      translations: null,
      note: "Parent school (if this is a branch)",
      conditions: [
        {
          name: "Hide if main campus",
          rule: {
            main_campus: {
              _eq: true,
            },
          },
          hidden: true,
          options: {},
        },
      ],
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "canteen",
      special: ["boolean"],
      interface: "boolean",
      options: null,
      display: "boolean",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 12,
      width: "half",
      translations: null,
      note: "Does the school have a canteen?",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "boarding",
      special: ["boolean"],
      interface: "boolean",
      options: null,
      display: "boolean",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 13,
      width: "half",
      translations: null,
      note: "Does the school have boarding facilities?",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "email",
      special: null,
      interface: "input",
      options: {
        placeholder: "email@example.com",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 14,
      width: "half",
      translations: null,
      note: "Contact email address",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "phone",
      special: null,
      interface: "input",
      options: {
        placeholder: "+39 012 3456789",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 15,
      width: "half",
      translations: null,
      note: "Contact phone number",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 16,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 17,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "schools",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 18,
      width: "half",
      required: false,
    },
    {
      collection: "schools",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 19,
      width: "half",
      required: false,
    },
  ]);

  // Pre-populate with the schools from the requirements
  await knex("schools").insert([
    {
      name: "Liceo Antonio Rosmini",
      website_url: "https://www.rosmini.tn.it/",
    },
    {
      name: 'Liceo delle Scienze Umane "F. Filzi"',
      website_url: "https://www.liceofilzi.it/",
    },
    {
      name: 'Istituto d\'Istruzione "Don Milani"',
      website_url: "https://www.domir.it/",
    },
    {
      name: 'Istituto Tecnico Tecnologico "G. Marconi"',
      website_url: "https://www.marconirovereto.it/",
    },
    { name: "ITET Fontana", website_url: "https://www.fgfontana.eu/" },
    {
      name: "Liceo Artistico Depero",
      website_url: "https://www.istitutodellearti.tn.it/",
    },
    {
      name: "CFP Opera Armida Barelli",
      website_url: "https://www.operaarmidabarelli.org/",
    },
    {
      name: "Liceo Internazionale Arcivescovile",
      website_url: "https://www.arcivescoviletrento.it/",
    },
    {
      name: "Polo Giuseppe Veronesi CFP - MADE++",
      website_url: "https://www.cfpgveronesi.it/",
    },
    {
      name: "Liceo Steam International",
      website_url: "https://www.steaminternational.eu/",
    },
    {
      name: "Istituto di Formazione Professionale Alberghiero",
      website_url: "https://www.alberghierorovereto.it/",
    },
    {
      name: "C.F.P. U.P.T. - Scuola delle Professioni per il Terziario",
      website_url: "https://www.cfp-upt.it/",
    },
  ]);
}

export async function down(knex) {
  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "schools").delete();

  // Remove the collection from Directus
  await knex("directus_collections").where("collection", "schools").delete();

  // Drop the table
  await knex.schema.dropTableIfExists("schools");
}
