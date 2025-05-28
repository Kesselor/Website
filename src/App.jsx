



import React, { useState, useEffect } from 'react';
import './App.css';
import { db, initializeMockData } from './db';

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
  const [teams, setTeams] = useState([]);
  const [results, setResults] = useState([]); // flat results
  const [matchdays, setMatchdays] = useState([]); // all matchdays
  const [schedule, setSchedule] = useState([]);
  const [standings, setStandings] = useState([]);

  // Calculate standings from results
  function calculateStandings(teamsArr, resultsArr) {
    // Only include league games
    const leagueResults = resultsArr.filter(r => r.league === 'League Game');
    // Filter out duplicate games (same home, away, date, league)
    const uniqueLeagueResults = leagueResults.filter((event, idx, arr2) =>
      arr2.findIndex(e =>
        e.home === event.home &&
        e.away === event.away &&
        e.date === event.date &&
        e.league === event.league
      ) === idx
    );
    // Map team name to stats
    const stats = {};
    teamsArr.forEach(t => {
      const name = t.name || t; // t may be string or {name}
      stats[name] = { team: name, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
    });
    uniqueLeagueResults.forEach(r => {
      const [homeScore, awayScore] = r.score.split(':').map(s => parseInt(s.trim(), 10));
      if (!stats[r.home] || !stats[r.away]) return;
      stats[r.home].played++;
      stats[r.away].played++;
      stats[r.home].gf += homeScore;
      stats[r.home].ga += awayScore;
      stats[r.away].gf += awayScore;
      stats[r.away].ga += homeScore;
      if (homeScore > awayScore) {
        stats[r.home].w++;
        stats[r.home].pts += 3;
        stats[r.away].l++;
      } else if (homeScore < awayScore) {
        stats[r.away].w++;
        stats[r.away].pts += 3;
        stats[r.home].l++;
      } else {
        stats[r.home].d++;
        stats[r.away].d++;
        stats[r.home].pts++;
        stats[r.away].pts++;
      }
    });
    // Sort by pts, then GD, then GF
    return Object.values(stats).sort((a, b) =>
      b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
    );
  }

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
      setTeams(teamsArr);
      setMatchdays(matchdaysArr);
      setResults(resultsArr);
      setSchedule(scheduleArr);
      setStandings(calculateStandings(teamsArr, resultsArr));
    }
    loadData();
  }, []);

  // --- Dynamic Highlights Calculation ---
  function getDynamicHighlights(standings, results) {
    // Only count league games, unique by home/away/date/league
    const leagueResults = results.filter(r => r.league === 'League Game');
    const uniqueGames = leagueResults.filter((event, idx, arr2) =>
      arr2.findIndex(e =>
        e.home === event.home &&
        e.away === event.away &&
        e.date === event.date &&
        e.league === event.league
      ) === idx
    );
    // Build per-team stats and streaks
    const teamStats = {};
    standings.forEach(row => {
      teamStats[row.team] = { ...row, streak: '', unbeaten: false };
    });
    // For each team, build a streak string
    Object.keys(teamStats).forEach(team => {
      // Get this team's games, sorted by date
      const games = uniqueGames.filter(r => r.home === team || r.away === team)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      let streakType = null;
      let streakCount = 0;
      let unbeaten = true;
      let lastResult = null;
      // Find current streak (W/D/L) from most recent backwards
      for (let i = games.length - 1; i >= 0; i--) {
        const g = games[i];
        const isHome = g.home === team;
        const [homeScore, awayScore] = g.score.split(':').map(s => parseInt(s.trim(), 10));
        let result = 'D';
        if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) result = 'W';
        else if ((isHome && homeScore < awayScore) || (!isHome && awayScore < homeScore)) result = 'L';
        if (i === games.length - 1) lastResult = result;
        if (streakType === null) streakType = result;
        if (result === streakType) streakCount++;
        else break;
        if (result === 'L') unbeaten = false;
      }
      // Unbeaten streak (no losses)
      unbeaten = games.every(g => {
        const isHome = g.home === team;
        const [homeScore, awayScore] = g.score.split(':').map(s => parseInt(s.trim(), 10));
        return (isHome && homeScore >= awayScore) || (!isHome && awayScore >= homeScore);
      });
      // Build streak wording
      let streakStr = '';
      if (streakType === 'W' && streakCount > 1) streakStr = `Won ${streakCount} in a row`;
      else if (streakType === 'W') streakStr = `Won last game`;
      else if (streakType === 'D' && streakCount > 1) streakStr = `Drawn ${streakCount} in a row`;
      else if (streakType === 'D') streakStr = `Drew last game`;
      else if (streakType === 'L' && streakCount > 1) streakStr = `Lost ${streakCount} in a row`;
      else if (streakType === 'L') streakStr = `Lost last game`;
      if (unbeaten && games.length > 1) streakStr += (streakStr ? '; ' : '') + `Unbeaten in ${games.length}`;
      teamStats[team].streak = streakStr;
      teamStats[team].unbeaten = unbeaten;
    });
    // Build highlight lines, using sports-site style
    return standings.map(row => {
      const t = teamStats[row.team];
      let line = `${row.team}: ${row.w}W-${row.d}D-${row.l}L`;
      if (t.streak) line += ` (${t.streak})`;
      return line;
    });
  }

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
            {/* Find the matchday closest to today (not in the future) */}
            {(() => {
              if (!results.length || !matchdays.length) return null;
              // Only league games, unique
              const leagueResults = results.filter(r => r.league === 'League Game');
              const uniqueGames = leagueResults.filter((event, idx, arr2) =>
                arr2.findIndex(e =>
                  e.home === event.home &&
                  e.away === event.away &&
                  e.date === event.date &&
                  e.league === event.league
                ) === idx
              );
              // Find the latest matchday (not in the future)
              const today = new Date();
              // Parse matchday end dates
              const matchdaysWithParsed = matchdays.map(md => ({
                ...md,
                end: new Date(md.endDate.split('.').reverse().join('-'))
              }));
              // Find the matchday with the latest end date <= today
              const latestMatchday = matchdaysWithParsed
                .filter(md => md.end <= today)
                .sort((a, b) => b.end - a.end)[0];
              if (!latestMatchday) return <div className="no-games-message">No results yet.</div>;
              // Get results for that matchday
              const latestResults = uniqueGames.filter(r => r.matchdayId === latestMatchday.id);
              if (!latestResults.length) return <div className="no-games-message">No results for latest matchday.</div>;
              return latestResults.map((event, idx) => {
                const [homeScore, awayScore] = event.score.split(':').map(s => parseInt(s.trim(), 10));
                return (
                  <div className="event-card" key={idx}>
                    <div className="event-header">
                      <span className="event-league">{event.league}</span>
                      <span className="event-date">{event.date}</span>
                    </div>
                    <div className="event-teams">
                      <span className={homeScore > awayScore ? 'team font-bold' : 'team'}>{event.home}</span>
                      <span className="score">{event.score}</span>
                      <span className={awayScore > homeScore ? 'team font-bold' : 'team'}>{event.away}</span>
                    </div>
                  </div>
                );
              });
            })()}
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
          {page === 'schedule' && <SchedulePage schedule={schedule} />}
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

function SchedulePage({ schedule }) {
  return (
    <>
      <h2 className="section-title">Upcoming Schedule</h2>
      <div className="schedule-list-wrapper">
        <div className="schedule-list-container">
          <div className="event-list">
            {schedule.slice(0, 5).map((event, idx) => (
              <div className="event-card" key={idx}>
                <div className="event-header">
                  <span className="event-league">{event.league}</span>
                  <span className="event-date">{event.date} – {event.time}</span>
                </div>
                <div className="event-teams">
                  <span className="team">{event.home}</span>
                  <span className="score">vs</span>
                  <span className="team">{event.away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}




// Results by matchday with selector table and single matchday view, plus team filter below
function ResultsByMatchday({ results, matchdays }) {
  const filteredMatchdays = matchdays.filter(md => md && typeof md.startDate === 'string');
  const sortedMatchdays = [...filteredMatchdays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const selectedMatchday = sortedMatchdays[selectedIdx] || null;

  // Group results by matchdayId and sort by date within each matchday
  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.matchdayId]) grouped[r.matchdayId] = [];
    grouped[r.matchdayId].push(r);
  });
  Object.values(grouped).forEach(arr => arr.sort((a, b) => (a.date || '').localeCompare(b.date || '')));

  // Only show each game once (filter out duplicates by home/away/date/league)
  function uniqueGames(arr) {
    return arr.filter((event, idx, arr2) =>
      arr2.findIndex(e =>
        e.home === event.home &&
        e.away === event.away &&
        e.date === event.date &&
        e.league === event.league
      ) === idx
    );
  }

  // Navigation handlers
  const prevMatchday = () => setSelectedIdx(idx => Math.max(0, idx - 1));
  const nextMatchday = () => setSelectedIdx(idx => Math.min(sortedMatchdays.length - 1, idx + 1));

  // --- Team filter state and logic ---
  // Get all unique teams from results
  const allTeams = Array.from(new Set(results.flatMap(r => [r.home, r.away])));
  const [selectedTeam, setSelectedTeam] = React.useState(allTeams[0] || '');

  // All results for selected team, grouped by matchday
  const teamResultsByMatchday = sortedMatchdays.map(md => {
    const games = uniqueGames((grouped[md.id] || []).filter(r => r.home === selectedTeam || r.away === selectedTeam));
    return { matchday: md, games };
  });

  return (
    <>
      <h2 className="section-title">Results by Matchday</h2>
      <div className="results-by-matchday-layout">
        {/* Matchday selector table */}
        <table className="results-selector-table">
          <thead>
            <tr>
              <th className="results-selector-header">Matchdays</th>
            </tr>
          </thead>
          <tbody>
            {sortedMatchdays.map((md, idx) => (
              <tr key={md.id} className={`results-selector-row ${idx === selectedIdx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
                <td className={`results-selector-cell ${idx === selectedIdx ? 'active' : ''}`}>
                  {md.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Single matchday box */}
        <div className="results-display-area">
          {selectedMatchday && (
            <div className="matchday-block" key={selectedMatchday.id}>
              <div className="results-block-title-header">
                <span className="results-block-title-name">{selectedMatchday.name}</span>
                <span className="results-block-title-meta">
                  {selectedMatchday.startDate === selectedMatchday.endDate
                    ? selectedMatchday.startDate
                    : `${selectedMatchday.startDate} – ${selectedMatchday.endDate}`}
                </span>
              </div>
              <div className="event-list">
                {uniqueGames(grouped[selectedMatchday.id] || []).length === 0 ? (
                  <div className="no-games-message">No results for this matchday.</div>
                ) : (
                  uniqueGames(grouped[selectedMatchday.id] || []).map((event, idx) => {
                    const [homeScore, awayScore] = event.score.split(':').map(s => parseInt(s.trim(), 10));
                    return (
                      <div className="event-card" key={idx}>
                        <div className="event-header">
                          <span className="event-league">{event.league}</span>
                          <span className="event-date">{event.date}</span>
                        </div>
                        <div className="event-teams">
                          <span className={homeScore > awayScore ? 'team font-bold' : 'team'}>{event.home}</span>
                          <span className="score">{event.score}</span>
                          <span className={awayScore > homeScore ? 'team font-bold' : 'team'}>{event.away}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="results-navigation-controls">
                <button className="matchday-nav-button prev" onClick={prevMatchday} disabled={selectedIdx === 0}>
                  <span className="arrow">←</span> Previous
                </button>
                <span className="matchday-counter">{selectedIdx + 1} / {sortedMatchdays.length}</span>
                <button className="matchday-nav-button next" onClick={nextMatchday} disabled={selectedIdx === sortedMatchdays.length - 1}>
                  Next <span className="arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Team filter section --- */}
      <h2 className="section-title section-title-spacing-top">Results by Team</h2>
      <div className="results-by-matchday-layout"> {/* Reusing layout class */}
        {/* Team selector table */}
        <table className="results-selector-table">
          <thead>
            <tr>
              <th className="results-selector-header">Teams</th>
            </tr>
          </thead>
          <tbody>
            {allTeams.map((team) => (
              <tr key={team} className={`results-selector-row ${team === selectedTeam ? 'active' : ''}`} onClick={() => setSelectedTeam(team)}>
                <td className={`results-selector-cell ${team === selectedTeam ? 'active' : ''}`}>
                  {team}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* All matchdays for selected team */}
        <div className="results-display-area"> {/* Reusing layout class */}
          <div className="matchday-block team-results-matchday-block">
            <div className="results-block-title-header">
              <span className="results-block-title-name">All Results for <span className="highlight-team-name-header">{selectedTeam}</span></span>
            </div>
            <div className="event-list">
              {teamResultsByMatchday.every(md => md.games.length === 0) ? (
                <div className="no-games-message">No results for {selectedTeam}.</div>
              ) : (
                teamResultsByMatchday.map(({ matchday, games }) => (
                  games.length === 0 ? null : (
                    <div key={matchday.id} style={{ marginBottom: '1.2rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary-accent-color)', marginBottom: '0.3rem' }}>{matchday.name} <span style={{ fontWeight: 400, color: 'var(--text-color)', fontSize: '0.98em' }}>({matchday.startDate === matchday.endDate ? matchday.startDate : `${matchday.startDate} – ${matchday.endDate}`})</span></div>
                      {games.map((event, idx) => {
                        const [homeScore, awayScore] = event.score.split(':').map(s => parseInt(s.trim(), 10));
                        return (
                          <div className="event-card" key={idx} style={{ background: 'var(--bg-color)', border: '1px solid var(--primary-accent-color)', marginBottom: '0.5rem' }}>
                            <div className="event-header">
                              <span className="event-league">{event.league}</span>
                              <span className="event-date">{event.date}</span>
                            </div>
                            <div className="event-teams">
                              <span className="team" style={{ fontWeight: event.home === selectedTeam && homeScore >= awayScore ? 'bold' : 'normal', color: event.home === selectedTeam ? '#ffe066' : undefined }}>{event.home}</span>
                              <span className="score">{event.score}</span>
                              <span className="team" style={{ fontWeight: event.away === selectedTeam && awayScore >= homeScore ? 'bold' : 'normal', color: event.away === selectedTeam ? '#ffe066' : undefined }}>{event.away}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;