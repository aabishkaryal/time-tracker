# Time Tracker

A modern desktop time tracking application built with Tauri, SvelteKit, and SQLite. Track your productivity across different categories with a clean, intuitive interface.

## Features

- **Real-time Timer** - Start/stop timers with precision tracking
- **Category Management** - Organize activities with custom categories and icons
- **Daily Summaries** - View time spent across categories for any date
- **History View** - Browse your tracking history with calendar navigation
- **Archive System** - Archive/restore categories to keep your workspace clean
- **System Tray** - Minimize to system tray for background operation
- **Local Storage** - All data stored locally with SQLite database
- **Modern UI** - Clean interface built with Tailwind CSS and shadcn-svelte

## Screenshots

*Main Timer Interface with category sidebar and active timer*

## Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **Rust** (latest stable)
- **Tauri CLI**: `cargo install tauri-cli`

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Time-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   # or
   cargo tauri dev
   ```

### Building for Production

#### General Build
```bash
npm run build
cargo tauri build
```

#### macOS Universal Build
```bash
make build-macos
```
*Note: Requires code signing certificate configured in `certificate-base64.txt`*

## Usage

### Basic Time Tracking

1. **Create a Category**
   - Click the "+" button in the sidebar
   - Choose a name and icon for your activity
   - Your category appears in the sidebar

2. **Start Tracking**
   - Select a category from the sidebar
   - Click the "Start" button
   - The timer begins counting

3. **Stop and Save**
   - Click "Stop" when finished
   - Time is automatically saved to your selected category

### Advanced Features

- **View History**: Navigate to `/history` to see past tracking sessions
- **Manage Archives**: Use `/archives` to view and restore archived categories
- **Daily Summaries**: Each day shows total time per category
- **System Tray**: Close the window to minimize to system tray

## Development

### Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri
- **Database**: SQLite with automatic migrations
- **UI Components**: Custom library based on shadcn-svelte
- **Icons**: Lucide icons

### Project Structure

```
src/
├── routes/              # SvelteKit pages
├── lib/
│   ├── components/      # Reusable Svelte components
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
src-tauri/
├── src/
│   ├── commands.rs     # Tauri commands
│   ├── db.rs          # Database operations
│   └── main.rs        # Application entry point
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run check           # Type checking
npm run check:watch     # Watch mode type checking

# Code Quality
npm run lint            # ESLint + Prettier check
npm run format          # Format code

# Testing
npm run test            # Run all tests
npm run test:unit       # Unit tests (Vitest)
npm run test:integration # E2E tests (Playwright)

# Building
npm run build           # Build frontend
npm run preview         # Preview build
cargo tauri build       # Build desktop app
```

### Database Schema

The application uses SQLite with the following tables:

- **category**: Stores activity categories with icons and status
- **timer**: Records time tracking sessions
- **version**: Manages database schema migrations

Schema automatically migrates on app startup.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the linter: `npm run lint`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to your branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- Follow existing code style and conventions
- Add TypeScript types for new features
- Test your changes with both `npm run test` and manual testing
- Ensure the app builds successfully with `cargo tauri build`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check existing [GitHub Issues](../../issues)
2. Create a new issue with detailed description
3. Include your OS, Node.js version, and steps to reproduce

## Roadmap

- [ ] Export/import data functionality
- [ ] Time tracking goals and notifications
- [ ] Detailed reporting and analytics
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Multiple timer support

---

Built with love using Tauri and SvelteKit