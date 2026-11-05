# Study Focus Timer

A minimal, distraction-free study timer for students, created by Arnav Giri.

## Features

- Huge digital countdown that fills the screen
- Fullscreen mode with low-visibility controls that become clear on hover
- Compact hamburger menu for duration presets and other settings
- Semi-transparent side Start/Pause and Reset buttons
- 5, 25, 45 and 60-minute presets, plus custom 1–999-minute durations
- Optional completion alarm (generated locally with Web Audio)
- Accurate countdown based on elapsed wall-clock time, even when intervals are throttled
- Keyboard controls and responsive layout
- No libraries, tracking, backend, or build step

## How to use

Open `index.html` in a browser. Click the hamburger menu (top right) to set the duration and enter fullscreen. Hover over the side rail to use Start/Pause and Reset. On a touchscreen, tap the translucent buttons.

Keyboard shortcuts: **Space** starts/pauses; **R** resets; **F** toggles fullscreen; **M** opens/closes settings.

## Publish on GitHub Pages

Create a public repository named `study-focus-timer`. Upload `index.html` and `README.md` to its root. In **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/(root)**, then save.

Your expected URL: `https://arnavgiri.github.io/study-focus-timer/`

## Browser limitations

Fullscreen requires a user gesture and is not supported by every mobile browser. Audio may require prior interaction. When the device sleeps, a tab is suspended, or the browser is closed, an on-time alarm cannot be guaranteed. The displayed remaining time corrects itself when the page resumes.

## Attribution

Created for students by Arnav Giri.
