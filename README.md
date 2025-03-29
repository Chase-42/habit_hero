# Habit Hero

## Project Structure

This project follows Clean Architecture principles with the following structure:

```
src/
├── entities/           # Core business models and rules
│   ├── models/        # Domain models
│   ├── errors/        # Custom error classes
│   └── types/         # TypeScript types and interfaces
│
├── application/        # Use cases and interfaces
│   ├── use-cases/     # Business logic and use cases
│   ├── interfaces/    # Repository and service interfaces
│   └── dtos/          # Data transfer objects
│
├── infrastructure/     # External implementations
│   ├── repositories/  # Database implementations
│   ├── services/      # External service implementations
│   └── config/        # Infrastructure configuration
│
├── interface-adapters/ # Controllers and presenters
│   ├── controllers/   # Request handlers and controllers
│   ├── presenters/    # Data transformation and presentation
│   └── middleware/    # Custom middleware
│
└── frameworks/        # Next.js specific code
    ├── next/         # Next.js app directory and components
    └── di/           # Dependency injection setup
```

## Development Rules

### Import Rules

- Use relative imports instead of @ aliases
- Example: `import { Component } from '../../../components'` instead of `import { Component } from '@/components'`

### Clean Architecture Boundaries

The following rules enforce Clean Architecture principles:

1. **Entities Layer** (`src/entities/`)

   - Should not import from any other layer
   - Contains core business models and rules
   - Independent of any external concerns

2. **Application Layer** (`src/application/`)

   - Can only import from entities layer
   - Contains use cases and interfaces
   - Defines business operations

3. **Infrastructure Layer** (`src/infrastructure/`)

   - Can only import from application and entities layers
   - Implements external concerns (database, services)
   - Contains concrete implementations

4. **Interface Adapters Layer** (`src/interface-adapters/`)

   - Can only import from application and entities layers
   - Handles data transformation and presentation
   - Contains controllers and presenters

5. **Frameworks Layer** (`src/frameworks/`)
   - Can import from interface-adapters, entities, and infrastructure layers
   - Contains Next.js specific code
   - Handles UI and routing

## API Structure

📁 src/app/api
├── 📁 habits
│ ├── route.ts # List/Create habits
│ │ ├── GET ?userId={userId} # List habits
│ │ └── POST # Create habit
│ │ └── body: CreateHabitInput
│ │
│ └── 📁 [id]
│ └── route.ts # Single habit operations
│ ├── GET # Get habit
│ ├── PATCH # Update habit
│ │ └── body: UpdateHabitInput
│ └── DELETE # Delete/archive habit
│
├── 📁 habit-logs
│ ├── route.ts # List/Create logs
│ │ ├── GET  
│ │ │ ├── ?habitId={habitId} # Get logs for habit
│ │ │ └── ?userId={userId} # Get all user logs
│ │ └── POST # Create log
│ │ └── body: CreateHabitLogInput
│ │
│ └── 📁 [id]
│ └── route.ts # Single log operations
│ ├── GET # Get log
│ ├── PATCH # Update log
│ │ └── body: UpdateHabitLogInput
│ └── DELETE # Delete log
│
└── 📁 stats
└── route.ts # Get user stats
└── GET ?userId={userId} # Get user stats

## TODO

- [ ] Set up database and model
- [ ] Add auth
- [ ] Adding habit
- [ ] Deleting habit
- [ ] Editing habit
- [ ] Charts & graphs
