# Contributing to Time Tracker

Thank you for your interest in contributing to Time Tracker! This guide will help you get started with development and understand our technical architecture.

## 🚀 Quick Setup

### Prerequisites

- **Node.js** 20+ and npm
- **Git** for version control
- Modern browser with IndexedDB support for testing

### Development Environment

```bash
# Clone the repository
git clone https://github.com/aabishkaryal/time-tracker.git
cd time-tracker

# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

The development server runs at `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 + Shadcn UI primitives
- **State Management**: Zustand with persistence middleware
- **Database**: IndexedDB via Dexie.js for client-side storage
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages

### Project Structure

```
src/
├── components/             # Reusable UI components
│   ├── ui/                # Base components (Button, Input, etc.)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   └── CircularProgress.tsx # Custom timer progress component
│
├── pages/                 # Main application pages
│   ├── Timer.tsx         # Main timer interface
│   ├── Activities.tsx    # Activity management
│   ├── Settings.tsx      # Configuration page
│   └── Reports.tsx       # Analytics (coming soon)
│
├── lib/                  # Utility libraries and services
│   ├── indexeddb.ts      # Dexie database schema & operations
│   ├── database-service.ts # High-level database API layer
│   ├── notifications.ts  # Browser/audio notification handling
│   └── utils.ts          # Common utility functions
│
├── store/                # Zustand state management
│   └── index.ts          # Main store with timer, activities, settings
│
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared interfaces and types
│
└── App.tsx              # Root component with routing
```

### State Management Architecture

**Persistence Strategy**:

- **Fast Access**: Timer state, current activity, and settings in localStorage
- **Large Data**: Activities and sessions in IndexedDB via Dexie
- **Hybrid Approach**: Recent data cached in memory, full history in IndexedDB

### Database Schema

**IndexedDB Tables** (via Dexie):

```typescript
// Activities table
interface Activity {
  id?: number;
  name: string;
  createdAt: Date;
  lastUsed: Date;
  isArchived: boolean;
}

// Sessions table
interface Session {
  id?: number;
  activityId: number;
  activityName: string;
  type: "work" | "break";
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  dateKey: string; // YYYY-MM-DD for efficient querying
  completed: boolean;
  metadata?: {
    notes?: string;
    tags?: string[];
    productivity?: number;
    interruptions?: number;
  };
}

// Daily stats for analytics
interface DailyStats {
  dateKey: string; // Primary key: YYYY-MM-DD
  date: Date;
  totalWorkTime: number;
  totalBreakTime: number;
  sessionsCompleted: number;
  activitiesUsed: number;
  productivity: number;
  lastUpdated: Date;
}
```

**Database Indexes**:

- Activities: `name`, `lastUsed`, `isArchived`
- Sessions: `activityId`, `dateKey`, `completed`, `startTime`
- DailyStats: `dateKey` (primary)

## 🎨 UI/UX Guidelines

### Design System

- **Component Library**: Shadcn UI for accessibility primitives
- **Styling**: Tailwind CSS utility classes
- **Typography**: System font stack for performance
- **Spacing**: Consistent 4px base unit (Tailwind default)

## 🔧 Development Workflow

### Git Workflow

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** with clear, focused commits
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Submit pull request** with description of changes

### Commit Messages

Use conventional commits format:

```
type(scope): description

feat(timer): add break mode toggle button
fix(database): resolve IndexedDB compound index errors
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(store): simplify session persistence logic
```

### Code Style

- **ESLint**: Enforced via pre-commit hooks
- **TypeScript**: Strict mode enabled
- **Prettier**: Auto-formatting on save
- **Naming**: camelCase for variables, PascalCase for components

### Testing Strategy

**Current Testing Setup**:

- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint with React/TypeScript rules
- **Manual Testing**: Development server with hot reload

**Future Testing Plans**:

- **Unit Tests**: Vitest for utility functions and hooks
- **Integration Tests**: React Testing Library for components
- **E2E Tests**: Playwright for user workflows

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test in latest version** to ensure bug still exists
3. **Check browser compatibility** (Chrome, Firefox, Safari, Edge)

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what went wrong

**Steps to reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should have happened

**Environment**

- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120.0]
- Version: [e.g. latest main branch]

**Additional context**
Screenshots, console errors, or other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
Describe your ideal solution

**Alternatives Considered**
Other approaches you've thought about

**Implementation Notes**
Technical considerations or constraints
```

## 📦 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Test build process
- [ ] Create release tag
- [ ] Deploy to production

## 🏷️ Labels and Project Management

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high/medium/low` - Priority levels

### Project Boards

- **Backlog**: Planned features and improvements
- **In Progress**: Currently being worked on
- **Review**: Ready for code review
- **Done**: Completed and merged

## 🤝 Code Review Guidelines

### For Authors

- **Keep PRs small** and focused on single concern
- **Write clear descriptions** explaining the change
- **Include screenshots** for UI changes
- **Test thoroughly** before requesting review

### For Reviewers

- **Be constructive** and helpful in feedback
- **Focus on code quality** and maintainability
- **Check for accessibility** and performance implications
- **Approve when ready** or request specific changes

## 📚 Resources

### Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Dexie.js Guide](https://dexie.org/docs/)

### Design Resources

- [Shadcn UI Components](https://ui.shadcn.com)
- [Lucide Icon Library](https://lucide.dev/)

---

## Questions?

If you have questions about contributing, feel free to:

- **Open a discussion** on GitHub
- **Reach out** via the contact methods in README

Thank you for contributing to Time Tracker! 🎉
