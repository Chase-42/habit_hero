# Habit Hero 

## TODO 

- [ ] Set up database and model
- [ ] Add auth 
- [ ] Adding habit 
- [ ] Deleting habit 
- [ ] Editing habit 
- [ ] Charts & graphs


📁 src/app/api
├── 📁 habits
│   ├── route.ts                        # List/Create habits
│   │   ├── GET ?userId={userId}        # List habits
│   │   └── POST                        # Create habit
│   │       └── body: CreateHabitInput
│   │
│   └── 📁 [id]
│       └── route.ts                    # Single habit operations
│           ├── GET                     # Get habit
│           ├── PATCH                   # Update habit
│           │   └── body: UpdateHabitInput
│           └── DELETE                  # Delete/archive habit
│
├── 📁 habit-logs
│   ├── route.ts                        # List/Create logs
│   │   ├── GET                        
│   │   │   ├── ?habitId={habitId}     # Get logs for habit
│   │   │   └── ?userId={userId}       # Get all user logs
│   │   └── POST                       # Create log
│   │       └── body: CreateHabitLogInput
│   │
│   └── 📁 [id]
│       └── route.ts                    # Single log operations
│           ├── GET                     # Get log
│           ├── PATCH                   # Update log
│           │   └── body: UpdateHabitLogInput
│           └── DELETE                  # Delete log
│
└── 📁 stats
    └── route.ts                        # Get user stats
        └── GET ?userId={userId}        # Get user stats