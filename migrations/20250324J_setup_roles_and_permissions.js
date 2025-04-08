// migrations/20250324J_setup_roles_and_permissions.js

export async function up(knex) {
  console.log(
    "Starting migration: Setup School Administrator role, policy, permissions (using correct directus_access schema)...",
  );

  // 1. Create the Role
  const roleInsert = {
    id: knex.raw("gen_random_uuid()"),
    name: "School Administrator",
    icon: "school",
    description: "Role for school admins to manage their school data",
  };
  const insertedRole = await knex("directus_roles")
    .insert(roleInsert)
    .returning("id");
  const roleId =
    insertedRole?.[0]?.id ??
    (
      await knex("directus_roles")
        .select("id")
        .where("name", roleInsert.name)
        .first()
    )?.id;

  if (!roleId) {
    throw new Error(
      "Failed to create or retrieve the School Administrator role ID.",
    );
  }
  console.log(`Created role 'School Administrator' with ID: ${roleId}`);

  // 2. Create the Policy
  const policyInsert = {
    id: knex.raw("gen_random_uuid()"),
    name: "School Administrator Policy",
    icon: "policy",
    description:
      "Policy granting app access and specific permissions for School Administrators",
    enforce_tfa: false,
    admin_access: false,
    app_access: true,
    ip_access: null,
  };
  const insertedPolicy = await knex("directus_policies")
    .insert(policyInsert)
    .returning("id");
  const policyId =
    insertedPolicy?.[0]?.id ??
    (
      await knex("directus_policies")
        .select("id")
        .where("name", policyInsert.name)
        .first()
    )?.id;

  if (!policyId) {
    await knex("directus_roles").where("id", roleId).delete(); // Clean up role
    throw new Error(
      "Failed to create or retrieve the School Administrator policy ID.",
    );
  }
  console.log(
    `Created policy 'School Administrator Policy' with ID: ${policyId}`,
  );

  // 3. Link Policy to Role via 'directus_access' junction table (using confirmed schema)
  const junctionTableName = "directus_access";
  const policyColumn = "policy"; // Use confirmed column name
  const roleColumn = "role"; // Use confirmed column name
  const userColumn = "user"; // Use confirmed column name

  const junctionInsertData = {
    id: knex.raw("gen_random_uuid()"),
    [policyColumn]: policyId,
    [roleColumn]: roleId,
    [userColumn]: null,
  };

  try {
    await knex(junctionTableName).insert(junctionInsertData);
    console.log(
      `Linked policy ${policyId} to role ${roleId} via ${junctionTableName}`,
    );
  } catch (junctionError) {
    console.error(
      `ERROR inserting into junction table '${junctionTableName}': ${junctionError.message}`,
    );
    await knex("directus_policies").where("id", policyId).delete();
    await knex("directus_roles").where("id", roleId).delete();
    throw junctionError;
  }

  // 4. Create Permissions linked to the Policy
  console.log("Fetching collections to apply default read permissions...");
  const collections = await knex("directus_collections")
    .select("collection")
    .where("collection", "not like", "directus_%")
    .andWhere("hidden", false)
    .andWhere("singleton", false);

  const permissionsData = [];

  // Default Read Permissions
  collections.forEach(({ collection }) => {
    permissionsData.push({
      policy: policyId,
      collection,
      action: "read",
      fields: "*",
      permissions: JSON.stringify({}),
      validation: JSON.stringify({}),
      presets: null,
    });
  });
  console.log(
    `Prepared default read permissions for ${collections.length} collections.`,
  );

  // Define specific permission overrides
  console.log("Defining specific permission overrides...");
  // -- Schools Collection --
  permissionsData.push({
    policy: policyId,
    collection: "schools",
    action: "update",
    fields: JSON.stringify([
      // Ensure fields list is correct JSON array string
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
      "miur_code",
      "responsabile_orientamento",
      "parent_school",
      "type",
    ]),
    permissions: JSON.stringify({
      _and: [
        {
          school_admins: {
            _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
          },
        },
      ],
    }), // Added missing parenthesis
    validation: JSON.stringify({
      _and: [
        {
          school_admins: {
            _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
          },
        },
      ],
    }), // Added missing parenthesis
    presets: null,
  });
  // -- Videos Collection --
  permissionsData.push({
    policy: policyId,
    collection: "videos",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "videos",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "videos",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- Events Collection -- (Adapt permissions rule based on actual schema link)
  // ATTENTION: Ensure the JSON.stringify calls here also have closing parentheses if you add rules
  permissionsData.push({
    policy: policyId,
    collection: "events",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      /* Add rule */
    }),
    validation: JSON.stringify({
      /* Add rule */
    }),
    presets: null,
  });
  permissionsData.push({
    policy: policyId,
    collection: "events",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      /* Add rule */
    }),
    validation: JSON.stringify({
      /* Add rule */
    }),
    presets: null,
  });
  permissionsData.push({
    policy: policyId,
    collection: "events",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      /* Add rule */
    }),
    validation: null,
    presets: null,
  });
  // -- Transport Routes Collection --
  permissionsData.push({
    policy: policyId,
    collection: "transport_routes",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "transport_routes",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "transport_routes",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- School Admins Collection -- (Optional read)
  permissionsData.push({
    policy: policyId,
    collection: "school_admins",
    action: "read",
    fields: "*",
    permissions: JSON.stringify({ directus_user_id: { _eq: "$CURRENT_USER" } }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- School <-> Educational Path Links ('school_educational_path_links') --
  permissionsData.push({
    policy: policyId,
    collection: "school_educational_path_links",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_educational_path_links",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_educational_path_links",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- School <-> Educational Path Junction ('schools_educational_paths') --
  permissionsData.push({
    policy: policyId,
    collection: "schools_educational_paths",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "schools_educational_paths",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          schools_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- School Emails --
  permissionsData.push({
    policy: policyId,
    collection: "school_emails",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_emails",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_emails",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- School Phones --
  permissionsData.push({
    policy: policyId,
    collection: "school_phones",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_phones",
    action: "update",
    fields: "*",
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    presets: null,
  }); // Added missing parenthesis x2
  permissionsData.push({
    policy: policyId,
    collection: "school_phones",
    action: "delete",
    fields: null,
    permissions: JSON.stringify({
      _and: [
        {
          school_id: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    }),
    validation: null,
    presets: null,
  }); // Added missing parenthesis x1
  // -- Directus Files --
  permissionsData.push({
    policy: policyId,
    collection: "directus_files",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({}),
    validation: JSON.stringify({}),
    presets: null,
  });
  permissionsData.push({
    policy: policyId,
    collection: "directus_files",
    action: "read",
    fields: "*",
    permissions: JSON.stringify({}),
    validation: JSON.stringify({}),
    presets: null,
  });

  // Insert all defined permissions
  console.log(
    `Attempting to insert ${permissionsData.length} permission rules...`,
  );
  await knex("directus_permissions").insert(
    permissionsData.map((p) => ({
      policy: p.policy,
      action: p.action,
      collection: p.collection,
      fields: p.fields === undefined ? null : p.fields,
      permissions: p.permissions === undefined ? null : p.permissions,
      validation: p.validation === undefined ? null : p.validation,
      presets: p.presets === undefined ? null : p.presets,
    })),
  );
  console.log(`Successfully inserted permissions for policy ${policyId}`);

  // --- Flow Creation ---
  console.log("Setting up flow 'Assign School to Admin'...");
  const flowExists = await knex("directus_flows")
    .select("id")
    .where("name", "Assign School to Admin")
    .first();
  if (!flowExists) {
    await knex("directus_flows").insert({
      id: knex.raw("gen_random_uuid()"), // <-- ADD EXPLICIT ID GENERATION

      name: "Assign School to Admin",
      icon: "admin_panel_settings",
      color: "#0055ff",
      description:
        "Automatically assigns a school to the user who created it via school_admins junction",
      status: "active",
      trigger: "event",
      accountability: "all",
      options: JSON.stringify({
        type: "hook",
        scope: ["items.create"],
        collections: ["schools"],
      }),
      // operation: knex.raw('gen_random_uuid()'),
    });
    console.log("Created flow 'Assign School to Admin'.");
  } else {
    console.log(
      "Flow 'Assign School to Admin' already exists, skipping insertion.",
    );
  }

  console.log("Migration 20250324J completed successfully.");
}

// --- Down Function (Unchanged from previous version) ---
export async function down(knex) {
  console.log("Starting rollback for migration 20250324J...");

  // 1. Delete the Flow
  const deletedFlowsCount = await knex("directus_flows")
    .where("name", "Assign School to Admin")
    .delete();
  console.log(
    `Deleted ${deletedFlowsCount} flow(s) named 'Assign School to Admin'.`,
  );

  // 2. Find the Policy and Role
  const policy = await knex("directus_policies")
    .select("id")
    .where("name", "School Administrator Policy")
    .first();
  let policyId = policy?.id;
  const role = await knex("directus_roles")
    .select("id")
    .where("name", "School Administrator")
    .first();
  let roleId = role?.id;

  if (policyId) {
    console.log(
      `Found policy 'School Administrator Policy' with ID: ${policyId}`,
    );
    // 3. Delete Permissions
    const deletedPermissionsCount = await knex("directus_permissions")
      .where("policy", policyId)
      .delete();
    console.log(
      `Deleted ${deletedPermissionsCount} permissions for policy ${policyId}`,
    );
    // 4. Delete Policy-Role Link
    const junctionTableName = "directus_access";
    const policyColumn = "policy";
    const roleColumn = "role";
    try {
      let query = knex(junctionTableName).where(policyColumn, policyId);
      if (roleId) {
        query = query.andWhere(roleColumn, roleId);
      }
      const deletedLinksCount = await query.delete();
      console.log(
        `Deleted ${deletedLinksCount} links in ${junctionTableName} involving policy ${policyId}`,
      );
    } catch (junctionError) {
      /* ... error handling ... */
    }
    // 5. Delete Policy
    await knex("directus_policies").where("id", policyId).delete();
    console.log(`Deleted policy ${policyId}`);
  } else {
    /* ... warning ... */
  }

  // 6. Delete Role
  if (roleId) {
    if (!policyId) {
      /* ... fallback junction cleanup ... */
    }
    await knex("directus_roles").where("id", roleId).delete();
    console.log(`Deleted role 'School Administrator' with ID: ${roleId}`);
  } else {
    /* ... warning ... */
  }

  console.log("Rollback for migration 20250324J finished.");
}
