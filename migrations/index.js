// migrations/index.js
import * as school_types from "./20250324A_create_school_types.js";
import * as educational_paths from "./20250324B_create_educational_paths.js";
import * as schools from "./20250324C_create_schools.js";
import * as schools_educational_paths from "./20250324D_create_schools_educational_paths.js";
import * as videos from "./20250324E_create_videos.js";
import * as events from "./20250324F_create_events.js";
import * as transport_routes from "./20250324G_create_transport_routes.js";
import * as school_admins from "./20250324H_create_school_admins.js";
import * as site_settings from "./20250324I_create_site_settings.js";
import * as roles_permissions from "./20250324J_setup_roles_and_permissions.js";
import * as schema_update from "./20250324K_update_schema_for_rovereto_schools.js";
import * as run_seeds from "./20250324L_run_seed_data.js";

export const migrations = [
  school_types,
  educational_paths,
  schools,
  schools_educational_paths,
  videos,
  events,
  transport_routes,
  school_admins,
  site_settings,
  roles_permissions,
  schema_update,
  run_seeds,
];
