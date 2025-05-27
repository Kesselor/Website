// src/db.js
import Dexie from 'dexie';


export const db = new Dexie('SportsTrackerDB');
db.version(3).stores({
  teams: '++id,name',
  matchdays: '++id,startDate,endDate,name',
  results: '++id,matchdayId,league,home,away,score',
  schedule: '++id,date,league,home,away,time'
});

// Helper to initialize with mock data if empty
export async function initializeMockData() {
  const teams = ['Paul', 'Max', 'Johan', 'Markus'];
  // Define matchdays (now with startDate and endDate)
  const matchdays = [
    { startDate: '16.05.2025', endDate: '16.05.2025', name: 'Matchday 1' },
    { startDate: '17.05.2025', endDate: '18.05.2025', name: 'Matchday 2' },
    { startDate: '19.05.2025', endDate: '19.05.2025', name: 'Matchday 3' },
    { startDate: '20.05.2025', endDate: '21.05.2025', name: 'Matchday 4' },
  ];
  // Results now reference matchdayId (to be set after matchdays are added)
  // We'll assign results to matchdays as an example:
  // - Matchday 1: 16.05.2025
  // - Matchday 2: 17.05.2025 - 18.05.2025
  // - Matchday 3: 19.05.2025
  // - Matchday 4: 20.05.2025 - 21.05.2025
  // Each team plays once per matchday, 4 games per team, no duplicate teams per matchday
  const resultsRawMatchday = [
    // Matchday 1 (16.05.2025)
    { matchdayName: 'Matchday 1', league: 'League Game', home: 'Paul', away: 'Max', score: '2 : 1', date: '16.05.2025' },
    { matchdayName: 'Matchday 1', league: 'League Game', home: 'Johan', away: 'Markus', score: '0 : 3', date: '16.05.2025' },

    // Matchday 2 (17.05.2025)
    { matchdayName: 'Matchday 2', league: 'League Game', home: 'Max', away: 'Johan', score: '1 : 1', date: '17.05.2025' },
    { matchdayName: 'Matchday 2', league: 'League Game', home: 'Markus', away: 'Paul', score: '2 : 2', date: '17.05.2025' },

    // Matchday 3 (19.05.2025)
    { matchdayName: 'Matchday 3', league: 'League Game', home: 'Paul', away: 'Johan', score: '3 : 0', date: '19.05.2025' },
    { matchdayName: 'Matchday 3', league: 'League Game', home: 'Max', away: 'Markus', score: '2 : 2', date: '19.05.2025' },

    // Matchday 4 (20.05.2025)
    { matchdayName: 'Matchday 4', league: 'League Game', home: 'Markus', away: 'Max', score: '1 : 4', date: '20.05.2025' },
    { matchdayName: 'Matchday 4', league: 'League Game', home: 'Johan', away: 'Paul', score: '2 : 2', date: '20.05.2025' },
  ];
  // (resultsRaw removed: all results are now defined in resultsRawMatchday)
  const schedule = [
    { date: '28.05.2025', league: 'League Game', home: 'Paul', away: 'Johan', time: '18:00' },
    { date: '29.05.2025', league: 'League Game', home: 'Max', away: 'Markus', time: '19:00' },
    { date: '31.05.2025', league: 'Friendly Match', home: 'Johan', away: 'Paul', time: '17:30' },
    { date: '02.06.2025', league: 'League Game', home: 'Markus', away: 'Max', time: '20:00' },
    { date: '05.06.2025', league: 'League Game', home: 'Paul', away: 'Markus', time: '18:30' },
  ];

  // Only add if empty
  if ((await db.teams.count()) === 0) {
    await db.teams.bulkAdd(teams.map(name => ({ name })));
  }
  if ((await db.matchdays.count()) === 0) {
    // Add matchdays
    await db.matchdays.bulkAdd(matchdays);
  }
  // Always fetch matchdays from DB to get their real IDs
  const matchdaysFromDb = await db.matchdays.toArray();
  // Map matchday name to actual DB id
  const matchdayIdByName = {};
  matchdaysFromDb.forEach(md => {
    matchdayIdByName[md.name] = md.id;
  });
  // Add results with correct matchdayId if not present
  if ((await db.results.count()) === 0) {
    await db.results.bulkAdd(resultsRawMatchday.map(r => ({
      matchdayId: matchdayIdByName[r.matchdayName],
      league: r.league,
      home: r.home,
      away: r.away,
      score: r.score,
      date: r.date
    })));
  }
  if ((await db.schedule.count()) === 0) {
    await db.schedule.bulkAdd(schedule);
  }
}
