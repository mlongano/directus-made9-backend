// migrations/20250324L_run_seed_data.js

import { seeds } from "./seeds/index.js";

export async function up(knex) {
  // Run each seed
  for (const seedModule of seeds) {
    await seedModule.seed(knex);
  }

  console.log("✅ Seeds applied successfully during migration");
}

export async function down(knex) {
  // You could implement logic to remove seeded data here if needed
  // This is optional and depends on your requirements

  // Example: Clear specific data
  // await knex('events').delete();
  // await knex('school_emails').delete();
  // await knex('school_phones').delete();
  // await knex('school_educational_path_links').delete();
  // await knex('schools_educational_paths').delete();

  console.log(
    "⚠️ Seed rollback is not implemented. You may need to manually clean up data.",
  );
}
