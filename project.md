# Time Tracker - Privacy-First Pomodoro Timer

## Overview
A local-first time tracking application built with React, TypeScript, and Tailwind CSS. All data is stored locally using localStorage and IndexedDB for maximum privacy - no backend required.

## Core Features

### 🍅 Pomodoro Timer Page
- **Activity Selection**: Choose from predefined activities or create new ones
- **Custom Timer**: Override default work/break durations per session
- **Session Memory**: Custom timer durations persist for current activity until switching activities
- **Smart Notifications**: Audio and browser notifications when timer completes
- **Break Management**: Prompt users to take breaks (wait for user confirmation by default)
- **Pause/Resume**: Full control over timer with pause and resume functionality
- **Activity History**: Access previously used activities for quick selection
- **Cross-Tab Sync**: Consistent data across multiple browser tabs

### ⚙️ Settings Page
- **Default Timers**: Configure default work timer duration (e.g., 25 minutes)
- **Break Timer**: Set default break duration (e.g., 5 minutes)
- **Notification Preferences**: Choose between audio and browser notifications
- **Break Behavior**: Configure auto-start break vs wait for user confirmation
- **Theme Support**: Light/dark mode toggle
- **Activity Management**: Edit activity names or delete entire activity records
- **User Preferences**: Customize app behavior and appearance

### 📊 Reports Page
- **Time Tracking**: View total time dedicated to specific tasks
- **Session History**: Track individual session details (start/end times, date, duration)
- **Activity Analytics**: Detailed breakdown of time spent per activity
- **Future Analytics**: Expandable to include charts, graphs, and productivity insights
- **Data Visualization**: Help users understand their work patterns and productivity
- **Export Capability**: Future support for data export (CSV, JSON)

## Technical Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with localStorage and IndexedDB plugins
- **Data Storage**: localStorage + IndexedDB (local-first approach)
- **Build Tool**: Vite
- **No Backend**: Complete privacy with local data storage

## Key Behaviors
- **Timer Persistence**: Custom timer durations stick to current activity until switching
- **Activity Switching**: New activities use default timers from settings
- **No Limits**: No maximum or minimum time restrictions
- **Single Session**: Only one active timer across all browser tabs
- **Complete Privacy**: All data remains on user's device

## Privacy & Data
- **100% Local**: All data stored on user's device
- **No Tracking**: No analytics or data collection
- **Offline First**: Works without internet connection
- **User Control**: Complete ownership of personal data