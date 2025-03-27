// migrations/20250324J_setup_roles_and_permissions.js

export async function up(knex) {
  // Create the School Administrator role
  const [schoolAdminRole] = await knex("directus_roles")
    .insert({
      name: "School Administrator",
      icon: "school",
      description: "Role for school admins to manage their school data",
      enforce_tfa: false,
      admin_access: false,
      app_access: true,
    })
    .returning("id");

  // Get all collection names
  const collections = await knex("directus_collections")
    .select("collection")
    .where("collection", "not like", "directus_%")
    .andWhere("hidden", false);

  // Add permissions for School Administrator role
  const permissions = [];

  // Permissions for all collections (read-only)
  collections.forEach(({ collection }) => {
    permissions.push({
      role: schoolAdminRole,
      collection,
      action: "read",
      fields: "*",
    });
  });

  // Special permissions for the school collection
  permissions.push({
    role: schoolAdminRole,
    collection: "schools",
    action: "update",
    fields: [
      "name",
      "website_url",
      "description",
      "detailed_info",
      "address",
      "geo_location",
      "email",
      "phone",
      "logo",
      "canteen",
      "boarding",
    ],
    permissions: {
      _and: [
        {
          school_admins: {
            _some: {
              directus_user_id: {
                _eq: "$CURRENT_USER",
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_admins: {
            _some: {
              directus_user_id: {
                _eq: "$CURRENT_USER",
              },
            },
          },
        },
      ],
    },
  });

  // Full CRUD permissions for videos linked to their school
  permissions.push({
    role: schoolAdminRole,
    collection: "videos",
    action: "create",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "videos",
    action: "update",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "videos",
    action: "delete",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  // Full CRUD permissions for events linked to their school
  permissions.push({
    role: schoolAdminRole,
    collection: "events",
    action: "create",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "events",
    action: "update",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "events",
    action: "delete",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  // Full CRUD permissions for transport routes linked to their school
  permissions.push({
    role: schoolAdminRole,
    collection: "transport_routes",
    action: "create",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "transport_routes",
    action: "update",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "transport_routes",
    action: "delete",
    fields: "*",
    permissions: {
      _and: [
        {
          school_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  // Add permissions for managing relations between schools and educational paths
  permissions.push({
    role: schoolAdminRole,
    collection: "schools_educational_paths",
    action: "create",
    fields: "*",
    permissions: {
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "schools_educational_paths",
    action: "update",
    fields: "*",
    permissions: {
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
    validation: {
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "schools_educational_paths",
    action: "delete",
    fields: "*",
    permissions: {
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: {
                directus_user_id: {
                  _eq: "$CURRENT_USER",
                },
              },
            },
          },
        },
      ],
    },
  });

  // Permission to manage and upload files
  permissions.push({
    role: schoolAdminRole,
    collection: "directus_files",
    action: "create",
    fields: "*",
  });

  permissions.push({
    role: schoolAdminRole,
    collection: "directus_files",
    action: "read",
    fields: "*",
  });

  // Insert all permissions
  await knex("directus_permissions").insert(permissions);

  // Create a hook that automatically assigns new schools to their admin
  await knex("directus_flows").insert({
    name: "Assign School to Admin",
    icon: "admin_panel_settings",
    color: "#0055ff",
    description: "Automatically assigns a school to the user who created it",
    status: "active",
    trigger: "event",
    accountability: "all",
    options: {
      type: "action",
      scope: ["items.create"],
      collections: ["schools"],
    },
  });
}

export async function down(knex) {
  // Get the role ID
  const [schoolAdminRole] = await knex("directus_roles")
    .select("id")
    .where("name", "School Administrator");

  if (schoolAdminRole) {
    // Delete all permissions for this role
    await knex("directus_permissions")
      .where("role", schoolAdminRole.id)
      .delete();

    // Delete the role
    await knex("directus_roles").where("id", schoolAdminRole.id).delete();
  }

  // Delete the flow
  await knex("directus_flows").where("name", "Assign School to Admin").delete();
}
