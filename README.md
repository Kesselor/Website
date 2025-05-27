
# Sports Event Tracker

This is a simple, responsive sports event tracker website built with React, Vite, and IndexedDB (via Dexie.js). It allows you to:

- View the latest results for the most recent matchday (not in the future) and a live-updating standings table on the Home page
- Browse all results by matchday or by team, with navigation and filtering, on the Results page
- See the upcoming schedule in a clean, card-based layout on the Schedule page

## Features

- Clean, responsive design inspired by sports news sites
- Data is stored locally in the browser using IndexedDB (Dexie.js)
- Standings and highlights update automatically based on results
- Dynamic, sports-style highlights (win/draw/loss streaks, unbeaten runs) generated from real data
- Results and standings always reflect the latest matchday and are grouped by matchday and team
- No authentication or account features

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/db.js` – IndexedDB (Dexie.js) schema, mock data, and initialization logic
- `src/App.jsx` – Main React component, navigation, and all page logic (including dynamic highlights and latest results logic)
- `src/App.css` – Main styles for layout and components
- `public/` – Static assets

## Customization

You can easily adjust the mock data in `src/db.js` to fit your own teams, results, and schedule.

---
Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [Dexie.js](https://dexie.org/).
