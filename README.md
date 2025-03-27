# Directus per il progetto MaDe 9 2025 - retescuolevallagarina.it

# Using ES Modules with Directus Migrations and Seeds

This document provides a guide for using ES Modules syntax instead of CommonJS in your Directus migrations and seeds.

## Directory Structure

```
project/
├── docker-compose.yml
├── migrations/
│   ├── 20250324A_create_school_types.js
│   ├── 20250324B_create_educational_paths.js
│   ├── ... other migration files
│   ├── 20250324L_run_seed_data.js
│   ├── index.js
│   └── package.json  # Specify "type": "module"
├── seeds/
│   ├── 01_import_rovereto_schools.js
│   ├── index.js
│   └── package.json  # Specify "type": "module"
└── README.md
```

## Setup Steps

### 1. Create package.json Files

In both the migrations and seeds directories, create a package.json file:

**migrations/package.json**:

```json
{
  "name": "directus-migrations",
  "type": "module",
  "version": "1.0.0"
}
```

**seeds/package.json**:

```json
{
  "name": "directus-seeds",
  "type": "module",
  "version": "1.0.0"
}
```

This tells Node.js to treat `.js` files in these directories as ES modules.

### 2. Write Migrations Using ES Module Syntax

Convert migrations from CommonJS to ES module syntax:

```javascript
// Old CommonJS syntax
exports.up = async function (knex) {
  // Migration code
};

exports.down = async function (knex) {
  // Rollback code
};

// New ES Module syntax
export async function up(knex) {
  // Migration code
}

export async function down(knex) {
  // Rollback code
}
```

### 3. Create an Index File for Migrations

Create an index.js file that imports and exports all migrations:

```javascript
// migrations/index.js
import * as school_types from "./20250324A_create_school_types.js";
import * as educational_paths from "./20250324B_create_educational_paths.js";
// Import other migrations...

export const migrations = [
  school_types,
  educational_paths,
  // Other migrations in order...
];
```

### 4. Create Seed Files Using ES Module Syntax

Write seed files using ES module syntax:

```javascript
// seeds/01_import_rovereto_schools.js
export async function seed(knex) {
  // Seeding logic
}
```

### 5. Create an Index File for Seeds

Create an index.js file that imports and exports all seeds:

```javascript
// seeds/index.js
import * as rovereto_schools from "./01_import_rovereto_schools.js";
// Import other seeds...

export const seeds = [
  rovereto_schools,
  // Other seeds...
];
```

### 6. Create a Migration to Run Seeds

```javascript
// migrations/20250324L_run_seed_data.js
import { seeds } from "../seeds/index.js";

export async function up(knex) {
  // Run each seed
  for (const seedModule of seeds) {
    await seedModule.seed(knex);
  }
}

export async function down(knex) {
  // Seed rollback logic if needed
}
```

### 7. Update Docker Compose Configuration

```yaml
services:
  directus:
    image: directus/directus:latest
    # ... other configurations
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
      - ./migrations:/directus/migrations
      - ./seeds:/directus/seeds
    environment:
      # ... other environment variables
      MIGRATIONS_DIRECTORY: "/directus/migrations"
      MIGRATIONS_AUTO_RUN: "true"
      # Use ESM format
      NODE_OPTIONS: "--experimental-specifier-resolution=node"
```

## Important Notes

1. **File Extensions**: Always include the `.js` extension in import statements:

   ```javascript
   // Correct
   import { something } from "./file.js";

   // Incorrect in ES modules
   import { something } from "./file";
   ```

2. **Node.js Version**: Ensure you're using Node.js 14.x or higher for better ES modules support.

3. **Top-level Await**: ES modules support top-level await, which can be useful in migrations.

4. **Debugging**: If you encounter issues, you can test your ES modules setup with:

   ```bash
   node --input-type=module ./migrations/index.js
   ```

5. **Docker Environment**: When using Docker, make sure the container has access to the appropriate package.json files.

By following these steps, you can use modern ES Modules syntax for your Directus migrations and seeds, making your code cleaner and more maintainable.
