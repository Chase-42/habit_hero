import fs from "fs";
import path from "path";

const newStructure = {
  "src/entities": {
    models: "Domain models and business rules",
    errors: "Custom error classes",
    types: "TypeScript types and interfaces",
  },
  "src/application": {
    "use-cases": "Business logic and use cases",
    interfaces: "Repository and service interfaces",
    dtos: "Data transfer objects",
  },
  "src/infrastructure": {
    repositories: "Database implementations",
    services: "External service implementations",
    config: "Infrastructure configuration",
  },
  "src/interface-adapters": {
    controllers: "Request handlers and controllers",
    presenters: "Data transformation and presentation",
    middleware: "Custom middleware",
  },
  "src/frameworks": {
    next: {
      app: "Next.js app directory",
      components: "React components",
      styles: "CSS and styling",
    },
    di: "Dependency injection setup",
  },
};

function createDirectoryStructure(
  basePath: string,
  structure: Record<string, any>,
  level = 0
) {
  Object.entries(structure).forEach(([dir, content]) => {
    const fullPath = path.join(basePath, dir);

    // Create directory
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Create README.md if content is a string
    if (typeof content === "string") {
      const readmePath = path.join(fullPath, "README.md");
      if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, `# ${dir}\n\n${content}`);
      }
    }
    // Recursively create subdirectories
    else if (typeof content === "object") {
      createDirectoryStructure(fullPath, content, level + 1);
    }
  });
}

// Create the new structure
createDirectoryStructure(".", newStructure);

console.log("Project structure reorganized successfully!");
