import fs from "fs";
import path from "path";

const migrationMap = {
  // Move existing components
  "src/components": "src/frameworks/next/components",
  "src/app": "src/frameworks/next/app",
  "src/styles": "src/frameworks/next/styles",

  // Move database related code
  "src/server/db": "src/infrastructure/repositories",
  drizzle: "src/infrastructure/repositories/drizzle",

  // Move types and schemas
  "src/types": "src/entities/types",
  "src/schemas": "src/entities/models",

  // Move middleware
  "src/middleware.ts": "src/interface-adapters/middleware",

  // Move environment config
  "src/env.js": "src/infrastructure/config",

  // Move hooks
  "src/hooks": "src/frameworks/next/hooks",
};

function migrateFiles() {
  Object.entries(migrationMap).forEach(([source, destination]) => {
    const sourcePath = path.resolve(source);
    const destPath = path.resolve(destination);

    if (fs.existsSync(sourcePath)) {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      // If source is a file, move it
      if (fs.statSync(sourcePath).isFile()) {
        const fileName = path.basename(sourcePath);
        fs.renameSync(sourcePath, path.join(destPath, fileName));
      } else {
        // If source is a directory, move all contents
        fs.readdirSync(sourcePath).forEach((file) => {
          const sourceFile = path.join(sourcePath, file);
          const destFile = path.join(destPath, file);
          fs.renameSync(sourceFile, destFile);
        });
      }

      console.log(`Migrated ${source} to ${destination}`);
    }
  });
}

// Create necessary directories first
const directories = [
  "src/entities/models",
  "src/entities/errors",
  "src/entities/types",
  "src/application/use-cases",
  "src/application/interfaces",
  "src/application/dtos",
  "src/infrastructure/repositories",
  "src/infrastructure/services",
  "src/infrastructure/config",
  "src/interface-adapters/controllers",
  "src/interface-adapters/presenters",
  "src/interface-adapters/middleware",
  "src/frameworks/next/app",
  "src/frameworks/next/components",
  "src/frameworks/next/styles",
  "src/frameworks/di",
];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Run migration
migrateFiles();

console.log("Migration completed successfully!");
