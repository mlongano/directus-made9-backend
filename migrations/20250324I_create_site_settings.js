// migrations/20250324I_create_site_settings.js

export async function up(knex) {
  // Create the site_settings table as a singleton collection
  await knex.schema.createTable("site_settings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("site_title").defaultTo("Orientamento Scuole di Rovereto");
    table.text("welcome_message");
    table.string("contact_email");
    table
      .uuid("homepage_hero_image")
      .references("id")
      .inTable("directus_files");
    table.text("footer_text");
    table.json("social_media_links");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus as a singleton
  await knex("directus_collections").insert({
    collection: "site_settings",
    icon: "settings",
    note: "Global site settings",
    display_template: "{{site_title}}",
    archive_field: null,
    archive_app_filter: true,
    archive_value: null,
    unarchive_value: null,
    singleton: true,
    sort_field: null,
  });

  // Add fields to Directus
  await knex("directus_fields").insert([
    {
      collection: "site_settings",
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
      collection: "site_settings",
      field: "site_title",
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
      note: "The title of the website",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "site_settings",
      field: "welcome_message",
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
          "link",
        ],
      },
      display: "formatted-value",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 3,
      width: "full",
      translations: null,
      note: "Welcome message displayed on the homepage",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "contact_email",
      special: null,
      interface: "input",
      options: {
        placeholder: "contact@example.com",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      translations: null,
      note: "Contact email for the site",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "homepage_hero_image",
      special: ["file"],
      interface: "file-image",
      options: {
        crop: false,
      },
      display: "image",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 5,
      width: "full",
      translations: null,
      note: "Hero image for the homepage",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "footer_text",
      special: ["wysiwyg"],
      interface: "input-rich-text-html",
      options: {
        toolbar: ["bold", "italic", "underline", "link"],
      },
      display: "formatted-value",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 6,
      width: "full",
      translations: null,
      note: "Text displayed in the footer of all pages",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "social_media_links",
      special: ["json"],
      interface: "list",
      options: {
        template: "{{platform}}: {{url}}",
        fields: [
          {
            field: "platform",
            type: "string",
            name: "Platform",
            meta: {
              field: "platform",
              type: "string",
              interface: "select-dropdown",
              options: {
                choices: [
                  { text: "Facebook", value: "facebook" },
                  { text: "Twitter", value: "twitter" },
                  { text: "Instagram", value: "instagram" },
                  { text: "YouTube", value: "youtube" },
                  { text: "LinkedIn", value: "linkedin" },
                ],
              },
            },
          },
          {
            field: "url",
            type: "string",
            name: "URL",
            meta: {
              field: "url",
              type: "string",
              interface: "input",
              options: {
                placeholder: "https://",
              },
            },
          },
        ],
      },
      display: "formatted-json-value",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 7,
      width: "full",
      translations: null,
      note: "Social media links",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "featured_schools",
      special: ["m2m"],
      interface: "list-m2m",
      options: {
        template: "{{schools_id.name}}",
      },
      display: "related-values",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 8,
      width: "full",
      translations: null,
      note: "Schools to feature on the homepage",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 9,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 10,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "site_settings",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 11,
      width: "half",
      required: false,
    },
    {
      collection: "site_settings",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 12,
      width: "half",
      required: false,
    },
  ]);

  // Create a junction table for featured schools
  await knex.schema.createTable("site_settings_featured_schools", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("site_settings_id")
      .references("id")
      .inTable("site_settings")
      .onDelete("CASCADE");
    table
      .uuid("schools_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.integer("sort").defaultTo(0);

    // Add a unique constraint to prevent duplicate relationships
    table.unique(["site_settings_id", "schools_id"]);
  });

  // Register the junction collection in Directus (hidden)
  await knex("directus_collections").insert({
    collection: "site_settings_featured_schools",
    icon: null,
    note: null,
    display_template: null,
    hidden: true,
    singleton: false,
    sort_field: "sort",
  });

  // Add relations for the featured schools
  await knex("directus_relations").insert([
    {
      many_collection: "site_settings_featured_schools",
      many_field: "site_settings_id",
      one_collection: "site_settings",
      one_field: "featured_schools",
      junction_field: "schools_id",
    },
    {
      many_collection: "site_settings_featured_schools",
      many_field: "schools_id",
      one_collection: "schools",
      one_field: null,
      junction_field: "site_settings_id",
    },
  ]);

  // Create initial site settings record
  await knex("site_settings").insert({
    site_title: "Orientamento Scuole di Rovereto",
    welcome_message:
      "<h1>Benvenuto al sito di orientamento delle Scuole di Rovereto</h1><p>Questo sito ti aiuterà a trovare la scuola superiore più adatta alle tue esigenze e ai tuoi interessi.</p>",
    contact_email: "orientamento@example.com",
    footer_text:
      "© 2025 Orientamento Scuole di Rovereto. Tutti i diritti riservati.",
  });
}

export async function down(knex) {
  // Remove the relations
  await knex("directus_relations")
    .where({
      many_collection: "site_settings_featured_schools",
    })
    .delete();

  // Remove the junction collection
  await knex("directus_collections")
    .where({
      collection: "site_settings_featured_schools",
    })
    .delete();

  // Drop the junction table
  await knex.schema.dropTableIfExists("site_settings_featured_schools");

  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "site_settings").delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "site_settings")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("site_settings");
}
