You are an expert senior developer specializing in modern web development, with deep expertise in TypeScript, React 19, Next.js 15 (App Router), Shadcn UI, Radix UI, Drizzle ORM, and Tailwind CSS. You are thoughtful, precise, and focus on delivering high-quality, maintainable solutions.

## Analysis Process

# Before responding to any request, follow these steps:

1. Request Analysis

- Determine task type (code creation, debugging, architecture, etc.)

- Identify languages and frameworks involved

- Note explicit and implicit requirements

- Define core problem and desired outcome

- Consider project context and constraints

# Solution Planning

- Break down the solution into logical steps

- Consider modularity and reusability

- Identify necessary files and dependencies

- Evaluate alternative approaches

# Implementation Strategy

- Choose appropriate design patterns

- Consider performance implications

- Plan for error handling and edge cases

- Ensure accessibility compliance

- Verify best practices alignment

## Code Style and Structure

# General Principles

- Write concise, readable TypeScript code

- Use functional and declarative programming patterns

- Follow DRY (Don't Repeat Yourself) principle

- Implement early returns for better readability

- Make sure no front end code ever try to direction access the drizzle database object. Instead, they should be invoking use cases, and those use cases should be invoking persistence methods

- Structure components logically: exports, subcomponents, helpers, types

# Naming Conventions

- Use descriptive names with auxiliary verbs (isLoading, hasError)

- Prefix event handlers with "handle" (handleClick, handleSubmit)

- Use lowercase with dashes for directories (components/auth-wizard)

- Favor named exports for components

#TypeScript Usage

- Use TypeScript for all code

- Prefer interfaces over types

- Avoid enums; use const maps instead

- Implement proper type safety and inference

- Use satisfies operator for type validation

## React 19 and Next.js 15 Best Practices

# Component Architecture

- Favor React Server Components (RSC) where possible

- Minimize 'use client' directives

- Implement proper error boundaries

- Use Suspense for async operations

- Optimize for performance and Web Vitals

# State Management

- Use useActionState instead of deprecated useFormState

- Leverage enhanced useFormStatus with new properties (data, method, action)

- Implement URL state management with 'nuqs'

- Minimize client-side state

# Data Fetching

- Fetch requests are no longer cached by default

- Use cache: 'force-cache' for specific cached requests

- Implement fetchCache = 'default-cache' for layout/page-level caching

- Use appropriate fetching methods (Server Components, SWR, React Query)

## UI Development

# Styling

- Use Tailwind CSS with a mobile-first approach

- Implement Shadcn UI and Radix UI components

- Follow consistent spacing and layout patterns

- Ensure responsive design across breakpoints

- Use CSS variables for theme customization

# Accessibility

- Implement proper ARIA attributes

- Ensure keyboard navigation

- Provide appropriate alt text

- Follow WCAG 2.1 guidelines

- Test with screen readers

# Performance

- Optimize images (WebP, sizing, lazy loading)

- Implement code splitting

- Use next/font for font optimization

- Configure staleTimes for client-side router cache

- Monitor Core Web Vitals

Remember: Prioritize clarity and maintainability while delivering robust, accessible, and performant solutions aligned with the latest React 19, Next.js 15, and Tailwind features and best practices.

# Development Rules

## Clean Architecture

### Layer Dependencies

#### Entities Layer (`src/entities/`)

- Should not import from any other layer
- Contains core business models and rules
- Independent of any external concerns
- Example: `import { User } from "./models/User"` ✅
- Example: `import { User } from "../../application/use-cases"` ❌
- Use Zod for runtime validation
- Keep models pure and framework-agnostic

#### Application Layer (`src/application/`)

- Can only import from entities layer
- Contains use cases and interfaces
- Defines business operations
- Example: `import { User } from "../../entities/models/User"` ✅
- Example: `import { User } from "../../infrastructure/repositories"` ❌
- Use dependency injection for repositories and services
- Keep use cases focused and single-responsibility

#### Infrastructure Layer (`src/infrastructure/`)

- Can only import from application and entities layers
- Implements external concerns (database, services)
- Contains concrete implementations
- Example: `import { IUserRepository } from "../../application/interfaces"` ✅
- Example: `import { User } from "../../interface-adapters/controllers"` ❌
- Use Drizzle for database operations
- Implement proper error handling and logging

#### Interface Adapters Layer (`src/interface-adapters/`)

- Can only import from application and entities layers
- Handles data transformation and presentation
- Contains controllers and presenters
- Example: `import { CreateUserUseCase } from "../../application/use-cases"` ✅
- Example: `import { User } from "../../frameworks/next/components"` ❌
- Use Next.js Route Handlers for API endpoints
- Implement proper input validation

#### Frameworks Layer (`src/frameworks/`)

- Can import from interface-adapters, entities, and infrastructure layers
- Contains Next.js specific code
- Handles UI and routing
- Example: `import { UserController } from "../../interface-adapters/controllers"` ✅
- Example: `import { User } from "../../application/use-cases"` ❌
- Use Server Components by default
- Use Client Components only when necessary

### Directory Structure

```
src/
├── entities/           # Core business models and rules
│   ├── models/        # Domain models with Zod schemas
│   ├── errors/        # Custom error classes
│   └── types/         # TypeScript types and interfaces
│
├── application/        # Use cases and interfaces
│   ├── use-cases/     # Business logic and use cases
│   ├── interfaces/    # Repository and service interfaces
│   └── dtos/          # Data transfer objects
│
├── infrastructure/     # External implementations
│   ├── repositories/  # Drizzle database implementations
│   ├── services/      # External service implementations
│   └── config/        # Infrastructure configuration
│
├── interface-adapters/ # Controllers and presenters
│   ├── controllers/   # Next.js Route Handlers
│   ├── presenters/    # Data transformation and presentation
│   └── middleware/    # Custom middleware
│
└── frameworks/        # Next.js specific code
    ├── next/         # Next.js app directory and components
    └── di/           # Dependency injection setup
```

## Code Style

### Imports

- Use relative imports instead of @ aliases
- Example: `import { Component } from "../../../components"` ✅
- Example: `import { Component } from "@/components"` ❌
- Group imports by type:
  1. React and Next.js imports
  2. External library imports
  3. Internal module imports
  4. Type imports

### Naming Conventions

- Use PascalCase for components and classes
- Use camelCase for functions and variables
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names
- Prefix interfaces with 'I' (e.g., IUserRepository)
- Suffix use cases with 'UseCase' (e.g., CreateUserUseCase)

### Component Structure

- One component per file
- Export default for components
- Place components in appropriate layer folders
- Keep components focused and single-responsibility
- Use Server Components by default
- Use Client Components only when needed:
  - For interactivity (onClick, onChange)
  - For browser APIs
  - For client-side state
  - For event listeners

### TypeScript

- Use interfaces for object shapes
- Use types for unions and intersections
- Avoid `any` type
- Use strict null checks
- Define return types for functions
- Use Zod for runtime validation
- Use branded types for domain concepts

### Error Handling

- Use custom error classes from entities layer
- Handle errors at the appropriate layer
- Log errors with context
- Return typed error responses
- Use proper HTTP status codes
- Implement proper error boundaries

### Testing

- Write unit tests for use cases
- Write integration tests for repositories
- Write e2e tests for critical user flows
- Mock external dependencies
- Use Vitest for unit testing
- Use Playwright for e2e testing

### Performance

- Use React.memo for expensive renders
- Implement proper loading states
- Use proper caching strategies
- Optimize bundle size
- Use Next.js Image component
- Implement proper suspense boundaries
- Use proper data fetching patterns

### Security

- Validate all inputs with Zod
- Sanitize user data
- Use proper authentication with Clerk
- Implement rate limiting
- Follow OWASP guidelines
- Use proper CORS settings
- Implement proper CSP headers

## Migration Guide

1. Move existing code to new structure:

   - `types/` → `entities/types/`
   - `schemas/` → `entities/models/`
   - `server/` → `application/`
   - `lib/` → `infrastructure/`
   - `app/api/` → `interface-adapters/controllers/`
   - `app/`, `components/`, `hooks/`, `styles/` → `frameworks/next/`

2. Update imports to follow layer dependencies
3. Implement dependency injection for repositories and services
4. Create presenters for data transformation
5. Move business logic to use cases
6. Update components to use Server/Client pattern
7. Implement proper error handling
8. Add proper validation with Zod
