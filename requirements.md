⏺ Time Tracker - User Requirements

Core Timer Features

Basic Timer Operation

- Pomodoro timer with start, pause, stop, reset controls
- Visual circular progress bar showing countdown
- Click to edit timer duration (minutes and seconds)
- Timer remembers custom duration during session (25min → 10min → stays 10min until activity change)
- Reset button restores your custom time (not default settings time)
- Can set timer to 00:00 but start button is disabled

Work & Break Modes

- Work sessions (green theme) and break sessions (amber theme)
- When work completes: prominent pulsing "Take a Break" button
- When break completes: "Back to Work" button
- Optional auto-start break timer setting
- Break completion returns to your custom work time (remembers 10min setting)

Completion Behavior

- Completion dialog only shows when timer actually runs down to 00:00
- No completion dialog when manually setting timer to 00:00
- All completion actions stop any playing notification sounds

Activity Management

Activity Selection

- Dropdown selector with "Unnamed Activity" as default
- Select from saved activities list
- Switching activities resets timer to default time (25min)
- Staying on same activity preserves custom time during session

Activity Management Page

- Create new activities
- Edit existing activity names
- Delete individual activities
- Select current activity (shows "Current" indicator)
- Clear all activities with confirmation
- "Use Unnamed Activity" quick action

Notifications & Audio

Sound Options

- 5 built-in sounds: Bell, Chime, Gentle, Digital + Custom
- Upload custom audio files (2MB limit, common formats)
- Browser notifications with permission handling
- Silent mode option
- Test all notification types functionality

Sound Control

- Stop sound button to halt playing notifications
- All timer actions (stop, reset, take break) automatically stop sounds

Settings & Preferences

Timer Settings

- Default work time (1-120 minutes)
- Default break time (1-60 minutes)
- Auto-start break toggle after work completion

Appearance

- Theme options: Light, dark, system (follows device)
- Real-time theme switching

Data Management

- Reset all settings to defaults with confirmation
- Session history showing completed timers (for debugging)
- Clear session history option

User Interface

Main Timer Page

- Large, prominent timer display
- Activity selector dropdown at top
- Timer controls (start/pause, stop, reset buttons)
- Completion dialog with action buttons
- Responsive design for all screen sizes

Activities Page

- Add new activities with name input
- List of all saved activities
- Edit/delete individual activities
- Current activity indicator
- Bulk actions (clear all)

Settings Page

- All timer preferences
- Notification settings with test buttons
- Theme selection
- Activity management section
- Session history display
- Reset options with confirmations

User Experience Flow

Typical Session

1. Start with 25min default timer on "Unnamed Activity"
2. Edit to 10min for this session
3. Select or create specific activity (resets to 25min default)
4. Edit back to 10min, start timer
5. Timer completes → pulsing "Take a Break" button appears
6. Click "Take a Break" → switches to 5min break timer
7. Break completes → "Back to Work" → returns to 10min work timer
8. Use stop/reset → timer returns to 10min (remembers your custom setting)
9. Switch to different activity → resets to 25min default

Key Behaviors

- Custom times stick to current session until activity change
- Activity switching always resets to defaults
- Stop/reset preserves current session's custom time
- Completion actions stop sounds and handle state properly
- Manual time editing prevents false completion dialogs

Data & Privacy

- Everything stored locally on your device
- No internet connection required
- No data collection or tracking
- Works across multiple browser tabs
- Complete privacy and data ownership
