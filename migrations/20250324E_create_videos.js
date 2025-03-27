// migrations/20250324E_create_videos.js

export async function up(knex) {
  // Create the videos table
  await knex.schema.createTable("videos", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title").notNullable();
    table.text("description");
    table.uuid("video_file").references("id").inTable("directus_files");
    table.string("youtube_id");
    table
      .uuid("school_id")
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    table.string("type");
    table.integer("sort").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.uuid("user_created").references("id").inTable("directus_users");
    table.uuid("user_updated").references("id").inTable("directus_users");
  });

  // Register the collection in Directus
  await knex("directus_collections").insert({
    collection: "videos",
    icon: "videocam",
    note: "Videos related to schools for orientation",
    display_template: "{{title}}",
    archive_field: null,
    archive_app_filter: true,
    archive_value: null,
    unarchive_value: null,
    singleton: false,
    sort_field: "sort",
  });

  // Add fields to Directus
  await knex("directus_fields").insert([
    {
      collection: "videos",
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
      collection: "videos",
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
      note: "Title of the video",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "videos",
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
      note: "Description of the video content",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "videos",
      field: "video_file",
      special: ["file"],
      interface: "file",
      options: {
        acceptedFiles: ["video/*"],
      },
      display: "file",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 4,
      width: "full",
      translations: null,
      note: "Upload video file (leave empty if using YouTube link)",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "videos",
      field: "youtube_id",
      special: null,
      interface: "input",
      options: {
        placeholder: "e.g., dQw4w9WgXcQ",
      },
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: false,
      sort: 5,
      width: "full",
      translations: null,
      note: "YouTube video ID (leave empty if uploading video file)",
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "videos",
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
      sort: 6,
      width: "full",
      translations: null,
      note: "School this video belongs to",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "videos",
      field: "type",
      special: null,
      interface: "select-dropdown",
      options: {
        choices: [
          {
            text: "Orientation",
            value: "orientation",
          },
          {
            text: "School Presentation",
            value: "presentation",
          },
          {
            text: "Facilities Tour",
            value: "facilities",
          },
          {
            text: "Student Experiences",
            value: "experiences",
          },
          {
            text: "Educational Programs",
            value: "programs",
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
      note: "Type of video content",
      conditions: null,
      required: true,
      group: null,
    },
    {
      collection: "videos",
      field: "sort",
      special: ["sort"],
      interface: "input",
      options: null,
      display: "raw",
      display_options: null,
      readonly: false,
      hidden: true,
      sort: 8,
      width: "full",
      translations: null,
      note: null,
      conditions: null,
      required: false,
      group: null,
    },
    {
      collection: "videos",
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
      collection: "videos",
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
      collection: "videos",
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
      collection: "videos",
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
    many_collection: "videos",
    many_field: "school_id",
    one_collection: "schools",
    one_field: null,
  });

  // Add the videos field to schools
  await knex("directus_fields").insert({
    collection: "schools",
    field: "videos",
    special: ["o2m"],
    interface: "list-o2m",
    options: {
      template: "{{title}}",
      enableCreate: true,
      enableSelect: true,
    },
    display: "related-values",
    display_options: {
      template: "{{title}}",
    },
    readonly: false,
    hidden: false,
    sort: 20,
    width: "full",
    translations: null,
    note: "Videos associated with this school",
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
      field: "videos",
    })
    .delete();

  // Remove the relation
  await knex("directus_relations")
    .where({
      many_collection: "videos",
      many_field: "school_id",
    })
    .delete();

  // Remove the fields from Directus
  await knex("directus_fields").where("collection", "videos").delete();

  // Remove the collection from Directus
  await knex("directus_collections").where("collection", "videos").delete();

  // Drop the table
  await knex.schema.dropTableIfExists("videos");
}
