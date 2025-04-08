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
    sort_field: 'start_date',
  });

  // Add fields to Directus
  // Explicitly using JSON.stringify() for options, display_options, special, conditions where they are objects/arrays
  await knex("directus_fields").insert([
    {
      collection: "events",
      field: "id",
      special: JSON.stringify(["uuid"]), // Stringify array
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
      special: null, // assuming simple text, adjust if wysiwyg intended
      interface: "input-rich-text-html", // Assuming Rich Text is desired
      options: JSON.stringify({
        // Stringify object
        toolbar: [
          "bold",
          "italic",
          "underline",
          "removeformat",
          "bullist",
          "numlist",
          "link",
        ],
      }),
      display: "formatted-value", // Changed from raw
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
      // Removed special: ["date-created"] as this is a user-defined date, not auto-created
      special: null,
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
      conditions: JSON.stringify([
        // Stringify array of objects
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
      ]),
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "is_online",
      special: JSON.stringify(["boolean"]), // Stringify array
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
      options: JSON.stringify({
        // Stringify object
        placeholder: "https://example.com/meeting",
      }),
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false, // Initially show, conditions will hide/show
      sort: 8,
      width: "full",
      translations: null,
      note: "Link to join the online event",
      conditions: JSON.stringify([
        // Stringify array of objects
        // Condition to show (redundant maybe, but explicit)
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
        // Condition to hide
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
      ]),
      required: false,
      group: null,
    },
    {
      collection: "events",
      field: "school_id",
      special: JSON.stringify(["m2o"]), // Stringify array
      interface: "select-dropdown-m2o",
      options: JSON.stringify({
        // Stringify object
        template: "{{name}}",
      }),
      display: "related-values",
      display_options: JSON.stringify({
        // Stringify object
        template: "{{name}}",
      }),
      readonly: false,
      hidden: false,
      sort: 9,
      width: "full",
      translations: null,
      note: "School hosting this event",
      conditions: null,
      required: true, // Assuming an event must belong to a school
      group: null,
    },
    {
      collection: "events",
      field: "image",
      special: JSON.stringify(["file"]), // Stringify array
      interface: "file-image",
      options: JSON.stringify({
        // Stringify object
        crop: false,
      }),
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
      special: JSON.stringify(["date-created"]), // Stringify array
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: JSON.stringify({ relative: true }), // Stringify object
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
      special: JSON.stringify(["date-updated"]), // Stringify array
      interface: "datetime",
      options: null,
      display: "datetime",
      display_options: JSON.stringify({ relative: true }), // Stringify object
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
      special: JSON.stringify(["user-created"]), // Stringify array
      interface: "select-dropdown-m2o",
      options: JSON.stringify({
        // Stringify object
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      }),
      display: "user",
      display_options: null,
      readonly: true,
      hidden: true,
      sort: 13,
      width: "half",
      required: false,
      group: null,
      translations: null,
      note: null,
      conditions: null,
    },
    {
      collection: "events",
      field: "user_updated",
      special: JSON.stringify(["user-updated"]), // Stringify array
      interface: "select-dropdown-m2o",
      options: JSON.stringify({
        // Stringify object
        template: "{{avatar.$thumbnail}} {{first_name}} {{last_name}}",
      }),
      display: "user",
      display_options: null,
      readonly: true,
      hidden: true,
      sort: 14,
      width: "half",
      required: false,
      group: null,
      translations: null,
      note: null,
      conditions: null,
    },
  ]);

  // Add relation to Directus
  await knex("directus_relations").insert({
    many_collection: "events",
    many_field: "school_id",
    one_collection: "schools",
    one_field: "events", // Define the reverse relation field name on schools
    // junction_field: null, // Not needed for o2m/m2o
    // one_allowed_collections: null, // Not needed
  });

  // Add the events field to schools (O2M relation)
  // Ensure this sort value doesn't conflict with others in schools
  await knex("directus_fields").insert({
    collection: "schools",
    field: "events",
    special: JSON.stringify(["o2m"]), // Stringify array
    interface: "list-o2m",
    options: JSON.stringify({
      // Stringify object
      template: "{{title}} ({{start_date}})",
      enableCreate: true,
      enableSelect: true,
      // Add sort field if you want events sorted within the school view
      // sortField: "start_date"
    }),
    display: "related-values",
    display_options: JSON.stringify({
      // Stringify object
      template: "{{title}} ({{start_date}})",
    }),
    readonly: false,
    hidden: false,
    sort: 21, // Ensure this sort order is logical within the schools collection fields
    width: "full",
    translations: null,
    note: "Events hosted by this school",
    conditions: null,
    required: false,
    group: null,
  });
}

// The down function remains the same as the original file
export async function down(knex) {
  // Remove the relation field from schools first
  await knex("directus_fields")
    .where({
      collection: "schools",
      field: "events",
    })
    .delete();

  // Remove the relation metadata
  await knex("directus_relations")
    .where({
      many_collection: "events",
      many_field: "school_id",
      one_collection: "schools",
      one_field: "events", // Match the one_field defined in 'up'
    })
    .delete();

  // Remove the fields for the 'events' collection
  await knex("directus_fields").where("collection", "events").delete();

  // Remove the 'events' collection metadata
  await knex("directus_collections").where("collection", "events").delete();

  // Drop the actual 'events' table
  await knex.schema.dropTableIfExists("events");
}
