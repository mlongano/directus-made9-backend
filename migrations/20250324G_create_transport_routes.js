// migrations/20250324G_create_transport_routes.js

export async function up(knex) {
  // Create the transport_routes table
  await knex.schema.createTable("transport_routes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.text("description");
    table.string("start_point").notNullable();
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.json("route_path");
    table.string("transportation_type");
    table.integer("estimated_time_minutes");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "transport_routes",
    icon: "directions",
    note: "Transport routes to reach schools",
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
      collection: "transport_routes",
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
      collection: "transport_routes",
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
      note: "Name of the route",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "transport_routes",
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
      note: "Description of the route",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "transport_routes",
      field: "start_point",
      special: null,
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      translations: null,
      note: "Starting point (e.g., Train Station, Bus Terminal)",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "transport_routes",
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
      sort: 5,
      width: "full",
      translations: null,
      note: "Destination school",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "transport_routes",
      field: "route_path",
      special: ["json"],
      interface: "input-map",
      options: {
        geometryType: "LineString",
      },
      display: "map",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 6,
      width: "full",
      translations: null,
      note: "Path of the route on the map",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "transport_routes",
      field: "transportation_type",
      special: null,
      interface: "select-dropdown",
      options: {
        choices: [
          {
            text: "Walking",
            value: "walking",
          },
          {
            text: "Bus",
            value: "bus",
          },
          {
            text: "Train",
            value: "train",
          },
          {
            text: "Mixed",
            value: "mixed",
          },
        ],
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 7,
      width: "half",
      translations: null,
      note: "Type of transportation",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "transport_routes",
      field: "estimated_time_minutes",
      special: null,
      interface: "input",
      options: {
        min: 1,
        max: 180,
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 8,
      width: "half",
      translations: null,
      note: "Estimated travel time in minutes",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "transport_routes",
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
      collection: "transport_routes",
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
      collection: "transport_routes",
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
      collection: "transport_routes",
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

  // Add relation to Directus
  await knex("directus_relations").insert({
    many_collection: "transport_routes",
    many_field: "school_id",
    one_collection: "schools",
    one_field: null,
  });

  // Add the transport_routes field to schools
  await knex("directus_fields").insert({
    collection: "schools",
    field: "transport_routes",
    special: ["o2m"],
    interface: "list-o2m",
    options: {
      template: "{{name}} ({{transportation_type}})",
      enableCreate: true,
      enableSelect: true,
    },
    display: "related-values",
    display_options: {
      template: "{{name}} ({{transportation_type}})",
    },
    readonly: false,
    hidden: false,
    sort: 22,
    width: "full",
    translations: null,
    note: "Transport routes to reach this school",
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
      field: "transport_routes",
    })
    .delete();

  // Remove the relation
  await knex("directus_relations")
    .where({
      many_collection: "transport_routes",
      many_field: "school_id",
    })
    .delete();

  // Remove the fields from Directus
  await knex("directus_fields")
    .where("collection", "transport_routes")
    .delete();

  // Remove the collection from Directus
  await knex("directus_collections")
    .where("collection", "transport_routes")
    .delete();

  // Drop the table
  await knex.schema.dropTableIfExists("transport_routes");
}
