// migrations/20250324F_create_events.js

export async function up(knex) {
  // Create the events table
  await knex.schema.createTable("events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title").notNullable();
    table.text("description");
    table.datetime("start_date").notNullable();
    table.datetime("end_date");
    table.string("location");
    table.boolean("is_online").defaultTo(false);
    table.string("online_link");
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.uuid("image").references("id").inTable("directus_files");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "events",
    icon: "event",
    note: "Orientation and open day events",
    display_template: "{{title}}",
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
      collection: "events",
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
      collection: "events",
      field: "title",
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
      note: "Title of the event",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "events",
      field: "description",
      special: null,
      interface: "input-rich-text-html",
      options: {
        toolbar: [
          "bold",
          "italic",
          "underline",
          "removeformat",
          "bullist",
          "numlist",
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
      note: "Description of the event",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "start_date",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "half",
      translations: null,
      note: "Start date and time",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "events",
      field: "end_date",
      special: null,
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 5,
      width: "half",
      translations: null,
      note: "End date and time",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "location",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 6,
      width: "half",
      translations: null,
      note: "Physical location of the event",
      conditions: [
        {
          name: "Hide if online",
          rule: {
            is_online: {
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
      collection: "events",
      field: "is_online",
      special: ["boolean"],
      interface: "boolean",
      options: null,
      display: "boolean",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 7,
      width: "half",
      translations: null,
      note: "Is this an online event?",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "online_link",
      special: null,
      interface: "input",
      options: {
        placeholder: "https://example.com/meeting",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 8,
      width: "full",
      translations: null,
      note: "Link to join the online event",
      conditions: [
        {
          name: "Show if online",
          rule: {
            is_online: {
              _eq: true,
            },
          },
          hidden: false,
          options: {},
        },
        {
          name: "Hide if not online",
          rule: {
            is_online: {
              _eq: false,
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
      collection: "events",
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
      sort: 9,
      width: "full",
      translations: null,
      note: "School hosting this event",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "events",
      field: "image",
      special: ["file"],
      interface: "file-image",
      options: {
        crop: false,
      },
      display: "image",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 10,
      width: "full",
      translations: null,
      note: "Event image or poster",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "created_at",
      special: ["date-created"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 11,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "updated_at",
      special: ["date-updated"],
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: { relative: true },
      readonly: true,
      hidden: true,
      sort: 12,
      width: "half",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "user_created",
      special: ["user-created"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 13,
      width: "half",
      required: false,
    },
    {
      collection: "events",
      field: "user_updated",
      special: ["user-updated"],
      interface: "select-dropdown-m2o",
      options: {
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      },
      display: "user",
      readonly: true,
      hidden: true,
      sort: 14,
      width: "half",
      required: false,
    },
  ]);

  // Add relation to Directus
  await knex("directus_relations").insert({
    many_collection: "events",
    many_field: "school_id",
    one_collection: "schools",
    one_field: null,
  });

  // Add the events field to schools
  await knex("directus_fields").insert({
    collection: "schools",
    field: "events",
    special: ["o2m"],
    interface: "list-o2m",
    options: {
      template: "{{title}} ({{start_date}})",
      enableCreate: true,
      enableSelect: true,
    },
    display: "related-values",
    display_options: {
      template: "{{title}} ({{start_date}})",
    },
    readonly: false,
    hidden: false,
    sort: 21,
    width: "full",
    translations: null,
    note: "Events hosted by this school",
    conditions: null,
    required: false,
    group: null,
  });
}

export async function down(knex) {
  // Remove the relation from schools
  await knex("directus_fields")
    .where({
      collection: "schools",
      field: "events",
    })
    .delete();

  // Remove the relation
  await knex("directus_relations")
    .where({
      many_collection: "events",
      many_field: "school_id",
    })
    .delete();

  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "events").delete();

  // Remove the collection from Directus
  await knex("directus_collections").where("collection", "events").delete();

  // Drop the table
  await knex.schema.dropTableIfExists("events");
}
