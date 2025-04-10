// migrations/20250324J_setup_roles_and_permissions.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  console.log(
    "Starting migration: Setup School Administrator role, policy, permissions...",
  );

  // --- 1. Create the Role ---
  const roleInsert = {
    // Use knex.fn.uuid() for standard UUID generation if your DB supports it
    // Otherwise, keep knex.raw("gen_random_uuid()") for PostgreSQL
    id: knex.raw("gen_random_uuid()"),
    name: "School Administrator",
    icon: "school",
    description: "Role for school admins to manage their school data",
    // admin_access: false, // Ensure this role does NOT have admin access
    // app_access: true, // Allow login to the app
  };
  let roleId;
  try {
    // Check if role already exists
    const existingRole = await knex("directus_roles")
      .select("id")
      .where("name", roleInsert.name)
      .first();
    if (existingRole) {
      roleId = existingRole.id;
      console.log(
        `Role '${roleInsert.name}' already exists with ID: ${roleId}. Skipping creation.`,
      );
    } else {
      const insertedRole = await knex("directus_roles")
        .insert(roleInsert)
        .returning("id");
      // Handle potential differences in returning format between DBs
      roleId = insertedRole?.[0]?.id || insertedRole?.[0];
      if (!roleId) throw new Error("Role creation did not return an ID.");
      console.log(`Created role '${roleInsert.name}' with ID: ${roleId}`);
    }
  } catch (error) {
    console.error("Error creating/finding role:", error);
    throw new Error(
      `Failed to create or retrieve the School Administrator role: ${error.message}`,
    );
  }

  // --- 2. Create the Policy ---
  const policyInsert = {
    id: knex.raw("gen_random_uuid()"),
    name: "School Administrator Policy",
    icon: "policy",
    description:
      "Policy granting app access and specific permissions for School Administrators",
    enforce_tfa: false,
    admin_access: false, // Policy should not grant admin access
    app_access: true, // Policy should grant app access
    ip_access: null,
  };
  let policyId;
  try {
    // Check if policy already exists
    const existingPolicy = await knex("directus_policies")
      .select("id")
      .where("name", policyInsert.name)
      .first();
    if (existingPolicy) {
      policyId = existingPolicy.id;
      console.log(
        `Policy '${policyInsert.name}' already exists with ID: ${policyId}. Skipping creation.`,
      );
    } else {
      const insertedPolicy = await knex("directus_policies")
        .insert(policyInsert)
        .returning("id");
      policyId = insertedPolicy?.[0]?.id || insertedPolicy?.[0];
      if (!policyId) throw new Error("Policy creation did not return an ID.");
      console.log(
        `Created policy '${policyInsert.name}' with ID: ${policyId}`,
      );
    }
  } catch (error) {
    console.error("Error creating/finding policy:", error);
    // Clean up role if policy creation failed
    await knex("directus_roles").where("id", roleId).delete();
    throw new Error(
      `Failed to create or retrieve the School Administrator policy: ${error.message}`,
    );
  }

  // --- 3. Link Policy to Role using directus_access ---
  try {
    await knex("directus_access").insert({
      id: knex.raw("gen_random_uuid()"),
      role: roleId,
      user: null,
      policy: policyId,
      sort: 1, // Or any appropriate sort value
    });
    console.log(`Linked policy ${policyId} to role ${roleId} in directus_access`);
  } catch (error) {
    console.error(`ERROR linking policy to role: ${error.message}`);
    // Clean up policy and role
    await knex("directus_policies").where("id", policyId).delete();
    await knex("directus_roles").where("id", roleId).delete();
    throw error;
  }

  // --- ADDED: Grant Full Permissions to Administrator Role ---
  const permissionsData = [];
  console.log("Fetching Administrator role ID...");
  const adminRole = await knex("directus_roles")
    .select("id")
    .where({ admin_access: true }) // Usually the safest way to find the Admin role
    .first();

  if (!adminRole) {
    console.warn(
      "Could not find the Administrator role. Skipping permission grant for Administrator.",
    );
  } else {
    const adminRoleId = adminRole.id;
    console.log(`Found Administrator role ID: ${adminRoleId}`);

    const collectionsToGrantAdminAccess = [
      "school_types",
      "educational_paths",
      "schools",
      "schools_educational_paths",
      "videos",
      "events",
      "transport_routes",
      "school_admins",
      "site_settings",
      "school_emails",
      "school_phones",
      "school_educational_path_links",
      // Add any other custom collections here
    ];

    console.log(
      `Adding full ('manage') permissions for Administrator role (${adminRoleId}) to ${collectionsToGrantAdminAccess.length} collections...`,
    );

    collectionsToGrantAdminAccess.forEach((collection) => {
      permissionsData.push({
        role: adminRoleId, // Assign directly to the Admin role
        collection: collection,
        action: "manage", // 'manage' grants full CRUD
        fields: "*",
        permissions: JSON.stringify({}), // Empty object means no item-specific restrictions
        validation: JSON.stringify({}), // Empty object means no validation rules
        presets: null,
        // NOTE: We are assigning directly to the role, not a policy here.
        // If your Directus version requires permissions tied ONLY to policies,
        // you would need to find the Admin role's associated policy ID instead
        // and assign the permission to that policyId.
        // However, assigning to the role directly is common for the built-in Admin role.
      });
    });
  }
  // --- END ADDED SECTION ---

  // --- 4. Create Permissions linked ONLY to the new Policy ---
  console.log("Preparing permissions for policy:", policyId);

  // Define collections this role should interact with
  // Ensure these names match your actual collection names
  const managedCollections = [
    "schools",
    "school_emails",
    "school_phones",
    "school_educational_path_links",
    "schools_educational_paths", // The M2M junction table
    "videos",
    "events", // Note: Events schema changed in K, rules need care
    "transport_routes",
    "school_admins", // For reading own assignments
    "directus_files", // For uploads/reads
    "educational_paths", // Need read access to link paths
    "school_types", // Need read access for school type field
    // Add other collections if needed (e.g., directus_users for user fields?)
  ];

  // --- Default Read Permissions for necessary related collections ---
  const readCollections = [
    "educational_paths",
    "school_types",
    "directus_users", // If needed for user_created/updated fields display
  ];
  readCollections.forEach((collection) => {
    permissionsData.push({
      policy: policyId,
      collection: collection,
      action: "read",
      fields: "*", // Or specify needed fields like ['id', 'name', 'email']
      permissions: JSON.stringify({}), // No specific item permissions needed for read
      validation: JSON.stringify({}),
      presets: null,
    });
  });

  // --- Specific Permissions ---

  // Helper for standard school-linked permissions
  const schoolAdminPermission = JSON.stringify({
    _and: [
      {
        school_admins: {
          _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
        },
      },
    ],
  });
  // Helper for permissions based on school_id field in the item
  const schoolIdPermission = (schoolIdField = "school_id") =>
    JSON.stringify({
      _and: [
        {
          [schoolIdField]: {
            school_admins: {
              _some: { directus_user_id: { _eq: "$CURRENT_USER" } },
            },
          },
        },
      ],
    });

  // -- Schools Collection --
  permissionsData.push({
    policy: policyId,
    collection: "schools",
    action: "read", // Allow reading all schools? Or add permission rule?
    fields: "*",
    permissions: JSON.stringify({}), // Allow reading all schools for simplicity
    validation: JSON.stringify({}),
    presets: null,
  });
  permissionsData.push({
    policy: policyId,
    collection: "schools",
    action: "update",
    // Define specific fields allowed for update
    fields: JSON.stringify([
      "name",
      "website_url",
      "description",
      "detailed_info",
      "address",
      "geo_location",
      "email", // Consider if school admins should update base email/phone
      "phone", // or if these should be via school_emails/school_phones
      "logo",
      "canteen",
      "boarding",
      "miur_code", // Added in K
      "responsabile_orientamento", // Added in K
      "parent_school",
      "type",
      // Add other fields school admins can update
    ]),
    permissions: schoolAdminPermission, // Can update schools they are linked to
    validation: schoolAdminPermission, // Validation uses same rule
    presets: null,
  });
  // Note: No 'create' or 'delete' for schools for this role assumed

  // -- School Emails, Phones, Path Links (Similar CRUD based on school_id) --
  ["school_emails", "school_phones", "school_educational_path_links"].forEach(
    (collection) => {
      ["create", "update"].forEach((action) => {
        permissionsData.push({
          policy: policyId,
          collection: collection,
          action: action,
          fields: "*", // Allow managing all fields
          permissions: schoolIdPermission(), // Check school_id link
          validation: schoolIdPermission(), // Check school_id link
          presets:
            action === "create"
              ? JSON.stringify({
                  // Pre-fill school_id if possible? Requires context.
                  // school_id: "$CURRENT_USER.school_id" // This syntax is illustrative, might not work directly
                })
              : null,
        });
      });
      permissionsData.push({
        policy: policyId,
        collection: collection,
        action: "delete",
        fields: null, // No fields needed for delete
        permissions: schoolIdPermission(), // Check school_id link
        validation: JSON.stringify({}), // No validation needed for delete usually
        presets: null,
      });
    },
  );

  // -- Videos, Transport Routes (Similar CRUD based on school_id) --
  ["videos", "transport_routes"].forEach((collection) => {
    ["create", "update"].forEach((action) => {
      permissionsData.push({
        policy: policyId,
        collection: collection,
        action: action,
        fields: "*",
        permissions: schoolIdPermission(),
        validation: schoolIdPermission(),
        presets: null,
      });
    });
    permissionsData.push({
      policy: policyId,
      collection: collection,
      action: "delete",
      fields: null,
      permissions: schoolIdPermission(),
      validation: JSON.stringify({}),
      presets: null,
    });
  });

// -- Events Collection -- (using school_id)
console.log("Adding permissions for 'events' collection...");
["create", "update"].forEach((action) => {
  permissionsData.push({
    policy: policyId,
    collection: "events",
    action: action,
    fields: "*", // Or specify allowed fields
    permissions: schoolIdPermission(), // Use standard check on events.school_id
    validation: schoolIdPermission(), // Use standard check on events.school_id
    presets: null, // Add presets if needed for create
  });
});
permissionsData.push({
  policy: policyId,
  collection: "events",
  action: "delete",
  fields: null,
  permissions: schoolIdPermission(), // Use standard check on events.school_id
  validation: JSON.stringify({}),
  presets: null,
});
  console.log(
    "Setting permissions for 'events' collection",
  );

  // -- School Admins Collection -- (Allow reading own assignments)
  permissionsData.push({
    policy: policyId,
    collection: "school_admins",
    action: "read",
    fields: "*", // Or specify ['id', 'school_id', 'directus_user_id']
    permissions: JSON.stringify({
      directus_user_id: { _eq: "$CURRENT_USER" },
    }),
    validation: JSON.stringify({}),
    presets: null,
  });
  // Note: No CUD for school_admins for this role assumed (managed by Admin)

  // -- Schools <-> Educational Paths (M2M Junction) --
  // Allow CUD if the linked school_id is managed by the user
  ["create", "delete"].forEach((action) => {
    permissionsData.push({
      policy: policyId,
      collection: "schools_educational_paths",
      action: action,
      fields: "*", // Junction table fields
      permissions: schoolIdPermission("schools_id"), // Check the schools_id field
      validation:
        action === "create" ? schoolIdPermission("schools_id") : JSON.stringify({}),
      presets: null,
    });
  });
  // Note: Update on junction usually not needed, handled by create/delete

  // -- Directus Files -- (Allow create/read)
  permissionsData.push({
    policy: policyId,
    collection: "directus_files",
    action: "create",
    fields: "*",
    permissions: JSON.stringify({}), // Allow creating any file
    validation: JSON.stringify({}),
    presets: null,
  });
  permissionsData.push({
    policy: policyId,
    collection: "directus_files",
    action: "read",
    fields: "*",
    permissions: JSON.stringify({}), // Allow reading any file (needed for display)
    validation: JSON.stringify({}),
    presets: null,
  });
  // Note: No update/delete on files assumed for this role

  // --- Insert all permissions ---
  if (permissionsData.length > 0) {
    try {
      // Use chunking for large number of permissions if necessary
      await knex("directus_permissions").insert(permissionsData);
      console.log(
        `Successfully inserted ${permissionsData.length} permissions for policy ${policyId}`,
      );
    } catch (error) {
      console.error(
        `ERROR inserting permissions for policy ${policyId}: ${error.message}`,
      );
      // Clean up policy and role if permissions fail
      await knex("directus_roles").where("id", roleId).update({ policy: null }); // Unlink first
      await knex("directus_policies").where("id", policyId).delete();
      await knex("directus_roles").where("id", roleId).delete();
      throw error;
    }
  } else {
    console.log("No permissions defined to insert.");
  }

  // --- 5. Flow Creation --- (Keep as is, assuming it's for Admin use)
  console.log("Setting up flow 'Assign School to Admin'...");
  const flowExists = await knex("directus_flows")
    .select("id")
    .where("name", "Assign School to Admin")
    .first();
  if (!flowExists) {
    await knex("directus_flows").insert({
      id: knex.raw("gen_random_uuid()"), // Explicit ID generation
      name: "Assign School to Admin",
      icon: "admin_panel_settings",
      color: "#0055ff",
      description:
        "Automatically assigns a school to the user who created it via school_admins junction",
      status: "active",
      trigger: "event", // Changed from 'hook' if using event scope
      accountability: "all",
      options: JSON.stringify({
        // type: "hook", // Remove if trigger is 'event'
        scope: ["items.create"],
        collections: ["school_admins"], // Trigger when a school_admins link is created
      }),
      // operation: knex.raw('gen_random_uuid()'), // Link to an operation if needed
    });
    console.log("Created flow 'Assign School to Admin'.");
  } else {
    console.log(
      "Flow 'Assign School to Admin' already exists, skipping insertion.",
    );
  }

  console.log("Migration 20250324J completed successfully.");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  console.log("Starting rollback for migration 20250324J...");

  // 1. Delete the Flow
  try {
    const deletedFlowsCount = await knex("directus_flows")
      .where("name", "Assign School to Admin")
      .delete();
    console.log(
      `Deleted ${deletedFlowsCount} flow(s) named 'Assign School to Admin'.`,
    );
  } catch (error) {
    console.warn(`Could not delete flow: ${error.message}`);
  }

  // 2. Find the Policy and Role (by name, as IDs might change)
  const policy = await knex("directus_policies")
    .select("id")
    .where("name", "School Administrator Policy")
    .first();
  const role = await knex("directus_roles")
    .select("id")
    .where("name", "School Administrator")
    .first();
  const policyId = policy?.id;
  const roleId = role?.id;

  // 3. Delete Permissions associated with the Policy
  if (policyId) {
    try {
      const deletedPermissionsCount = await knex("directus_permissions")
        .where("policy", policyId)
        .delete();
      console.log(
        `Deleted ${deletedPermissionsCount} permissions for policy ${policyId}`,
      );
    } catch (error) {
      console.warn(
        `Could not delete permissions for policy ${policyId}: ${error.message}`,
      );
    }
  } else {
    console.log("Policy not found, skipping permission deletion.");
  }

  // 4. Delete the directus_access entry linking the role and policy
  if (roleId) {
    try {
      await knex("directus_access")
        .where({ role: roleId })
        .delete();
      console.log(`Deleted directus_access entry for role ${roleId}`);
    } catch (error) {
      console.warn(
        `Could not delete directus_access entry for role ${roleId}: ${error.message}`,
      );
    }
  }

  // 5. Delete Role
  if (roleId) {
    try {
      await knex("directus_roles").where("id", roleId).delete();
      console.log(`Deleted role ${roleId}`);
    } catch (error) {
      console.warn(`Could not delete role ${roleId}: ${error.message}`);
    }
  } else {
    console.log("Role not found, skipping role deletion.");
  }

  console.log("Rollback for migration 20250324J finished.");
}
