# Typing Speed Test

A clean, distraction-free typing practice app built with HTML, CSS, and vanilla JavaScript. Measure typing speed, improve accuracy, and track your progress—directly in your browser.

**[Live Demo](https://arnavgiri.github.io/typing-speed-test/)** · **[Source Code](https://github.com/arnavgiri/typing-speed-test)**

## Features

- **Three test durations:** 30, 60, and 120 seconds.
- **Live statistics:** Words per minute (WPM), accuracy, mistakes, and time remaining.
- **Character-by-character feedback:** Correct and incorrect keystrokes are highlighted as you type.
- **Multiple passages:** Switch to a fresh practice passage anytime.
- **Results summary:** Review your speed, accuracy, and mistakes after each test.
- **Personal best and recent results:** Saved locally in your browser, with records grouped by test duration.
- **Dark and light themes:** Your selected theme is remembered.
- **Responsive interface:** Designed for desktop, tablet, and mobile screens.
- **Keyboard shortcuts:** Press `Esc` to restart a test.
- **Privacy-friendly:** No account, server, analytics, or external JavaScript libraries required.

## How to Use

1. Open the [live app](https://arnavgiri.github.io/typing-speed-test/).
2. Select a **30s**, **60s**, or **120s** test.
3. Click the typing passage and begin typing. The timer starts on your first keystroke.
4. Watch your WPM, accuracy, and mistakes update in real time.
5. When the timer ends or you finish the passage, review your results and start another test.

**WPM** is calculated from correctly typed characters, using five characters per word, divided by elapsed minutes. **Accuracy** is the percentage of typed characters that match the target passage.

## Run Locally

This is a static website. No installation or build step is needed.

1. Clone the repository:

   ```bash
   git clone https://github.com/arnavgiri/arnavgiri.github.io.git
   ```

2. Open `index.html` in your browser.

You can also serve the folder with any static web server.

## Project Structure

```text
typing-speed-test/
├── index.html      # Semantic page layout and controls
├── styles.css      # Responsive design, typography, and themes
├── app.js          # Typing engine, metrics, and local storage
├── favicon.svg     # Custom keyboard favicon
└── robots.txt      # Crawl instructions
```

The repository also includes a GitHub Actions workflow to update the stylesheet cache version when `styles.css` changes.

## Storage and Privacy

The app uses browser `localStorage` to remember the selected duration, theme, and recent typing results. Your typing activity stays on your device. Use **Clear history** in the app to remove saved test results.

## Deployment

This project is served from the `typing-speed-test/` folder of the [Arnav Giri portfolio repository](https://github.com/arnavgiri/arnavgiri.github.io).

## Author

Created by **Arnav Giri**.

---

Built for deliberate practice.
