



import React, { useState, useEffect } from 'react';
import './App.css';
import { db, initializeMockData } from './db';
import LatestResults from './components/LatestResults';
import MatchdayResultsView from './components/MatchdayResultsView';
import TeamResultsView from './components/TeamResultsView';
import SchedulePage from './components/SchedulePage'; // New Import
import { calculateStandings, getDynamicHighlights } from './utils';

function App() {
  const [page, setPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [page]);


  // State for DB data
  const [results, setResults] = useState([]); // flat results
  const [matchdays, setMatchdays] = useState([]); // all matchdays
  const [schedule, setSchedule] = useState([]);
  const [standings, setStandings] = useState([]);

  // Load data from DB on mount
  useEffect(() => {
    async function loadData() {
      await initializeMockData();
      const [teamsArr, matchdaysArr, resultsArr, scheduleArr] = await Promise.all([
        db.teams.toArray(),
        db.matchdays.toArray(),
        db.results.toArray(),
        db.schedule.toArray()
      ]);
      setMatchdays(matchdaysArr);
      setResults(resultsArr);
      setSchedule(scheduleArr);
      setStandings(calculateStandings(teamsArr, resultsArr));
    }
    loadData();
  }, []);

  const dynamicHighlights = getDynamicHighlights(standings, results);

  return (
    <div className="main-layout">
      <header className="header">
        <div className="logo-title">
          <span className="site-title">Sports Event Tracker</span>
        </div>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <nav className={`nav-bar ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <a href="#" className={`nav-link${page === 'home' ? ' active' : ''}`} onClick={() => setPage('home')}>Home</a>
          <a href="#" className={`nav-link${page === 'results' ? ' active' : ''}`} onClick={() => setPage('results')}>Results</a>
          <a href="#" className={`nav-link${page === 'schedule' ? ' active' : ''}`} onClick={() => setPage('schedule')}>Schedule</a>
          <button onClick={toggleTheme} className="theme-toggle-button">
            {theme === 'light' ? 'Switch to Dark Mode 🌙' : 'Switch to Light Mode ☀️'}
          </button>
        </nav>
      </header>
      <div className="content-wrapper">
        <main className="main-content">
          {page === 'home' && (
            <>
          <h2 className="section-title">Latest Results</h2>
          <div className="event-list">
            <LatestResults results={results} matchdays={matchdays} />
          </div>
              <h2 className="section-title section-title-standings">Standings</h2>
              <div className="standings-table-wrapper">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>Played</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row, idx) => (
                      <tr key={row.team}>
                        <td>{idx + 1}</td>
                        <td>{row.team}</td>
                        <td>{row.played}</td>
                        <td>{row.w}</td>
                        <td>{row.d}</td>
                        <td>{row.l}</td>
                        <td>{row.gf}</td>
                        <td>{row.ga}</td>
                        <td>{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {page === 'results' && <ResultsByMatchday results={results} matchdays={matchdays} />}
          {page === 'schedule' && <SchedulePage schedule={schedule} />} {/* Ensure this uses the imported component */}
        </main>
        <aside className="sidebar">
          <h3>Highlights</h3>
          <ul>
            {dynamicHighlights.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </aside>
      </div>
      <footer className="footer">
        &copy; 2025 Sports Event Tracker
      </footer>
    </div>
  );
}

// Results by matchday with selector table and single matchday view, plus team filter below
function ResultsByMatchday({ results, matchdays }) {
  return (
    <>
      <MatchdayResultsView results={results} matchdays={matchdays} />
      <TeamResultsView results={results} matchdays={matchdays} />
    </>
  );
}

export default App;