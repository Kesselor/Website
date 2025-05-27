


import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [page]);

  // Mock data
  const results = [
    { date: '21.05.2025', league: 'Friendly Match', home: 'Paul', away: 'Max', score: '3 : 2' },
    { date: '20.05.2025', league: 'League Game', home: 'Johan', away: 'Markus', score: '1 : 1' },
    { date: '19.05.2025', league: 'League Game', home: 'Max', away: 'Johan', score: '2 : 0' },
    { date: '18.05.2025', league: 'League Game', home: 'Paul', away: 'Markus', score: '4 : 1' },
    { date: '17.05.2025', league: 'League Game', home: 'Paul', away: 'Johan', score: '1 : 1' },
    { date: '16.05.2025', league: 'League Game', home: 'Max', away: 'Markus', score: '2 : 2' },
  ];
  // Standings based on results above
  const standings = [
    { team: 'Paul', played: 4, w: 2, d: 2, l: 0, gf: 10, ga: 6, pts: 8 },
    { team: 'Max', played: 4, w: 2, d: 1, l: 1, gf: 6, ga: 6, pts: 7 },
    { team: 'Johan', played: 4, w: 1, d: 3, l: 0, gf: 4, ga: 4, pts: 6 },
    { team: 'Markus', played: 4, w: 0, d: 2, l: 2, gf: 6, ga: 10, pts: 2 },
  ];
  // Mock schedule data for upcoming games
  const schedule = [
    { date: '28.05.2025', league: 'League Game', home: 'Paul', away: 'Johan', time: '18:00' },
    { date: '29.05.2025', league: 'League Game', home: 'Max', away: 'Markus', time: '19:00' },
    { date: '31.05.2025', league: 'Friendly Match', home: 'Johan', away: 'Paul', time: '17:30' },
    { date: '02.06.2025', league: 'League Game', home: 'Markus', away: 'Max', time: '20:00' },
    { date: '05.06.2025', league: 'League Game', home: 'Paul', away: 'Markus', time: '18:30' },
  ];

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
        </nav>
      </header>
      <div className="content-wrapper">
        <main className="main-content">
          {page === 'home' && (
            <>
              <h2 className="section-title">Latest Results</h2>
              <div className="event-list">
                {results.slice(0, 2).map((event, idx) => {
                  // Determine winner for bolding
                  const [homeScore, awayScore] = event.score.split(':').map(s => parseInt(s.trim(), 10));
                  return (
                    <div className="event-card" key={idx}>
                      <div className="event-header">
                        <span className="event-league">{event.league}</span>
                        <span className="event-date">{event.date}</span>
                      </div>
                      <div className="event-teams">
                        <span className="team" style={{ fontWeight: homeScore > awayScore ? 'bold' : 'normal' }}>{event.home}</span>
                        <span className="score">{event.score}</span>
                        <span className="team" style={{ fontWeight: awayScore > homeScore ? 'bold' : 'normal' }}>{event.away}</span>
                      </div>
                    </div>
                  );
                })}
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
          {page === 'results' && <ResultsScroller results={results} />}
          {page === 'schedule' && <SchedulePage schedule={schedule} />}
        </main>
        <aside className="sidebar">
          <h3>Highlights</h3>
          <ul>
            <li>Paul unbeaten in 4 games</li>
            <li>Max strong at home</li>
            <li>Johan: 3 draws in 4 matches</li>
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

function ResultsScroller({ results }) {
  const [selectedTeam, setSelectedTeam] = useState(Array.from(new Set(results.flatMap(r => [r.home, r.away])))[0]);
  const teams = Array.from(new Set(results.flatMap(r => [r.home, r.away])));
  // Add mock matchday data to each result
  const resultsWithMatchday = results.map((r, i) => ({ ...r, matchday: i + 1 }));
  const teamGames = resultsWithMatchday.filter(r => r.home === selectedTeam || r.away === selectedTeam);
  const [gameIdx, setGameIdx] = useState(0);

  // Reset gameIdx if team changes
  useEffect(() => { setGameIdx(0); }, [selectedTeam]);

  const currentGame = teamGames[gameIdx];

  return (
    <>
      <h2 className="section-title">Results by Team</h2>
      <div className="team-selector-wrapper">
        {teams.map(team => (
          <button
            key={team}
            className={`team-selector-button ${team === selectedTeam ? 'active' : ''}`}
            onClick={() => setSelectedTeam(team)}
          >
            {team}
          </button>
        ))}
      </div>
      {teamGames.length === 0 ? (
        <div className="no-games-message">No games found for {selectedTeam}.</div>
      ) : (
        <div className="matchday-scroller-wrapper">
          <div className="matchday-card">
            <div className="matchday-header">
              <div className="matchday-number">Matchday {currentGame.matchday}</div>
              <div className="matchday-date">{currentGame.date}</div>
              <div className="matchday-team-name">{selectedTeam}</div>
            </div>
            <div className="event-card matchday-event-card">
              <div className="event-header">
                <span className="event-league">{currentGame.league}</span>
              </div>
              <div className="event-teams">
                {/* Bold the winning team */}
                {(() => {
                  const [homeScore, awayScore] = currentGame.score.split(':').map(s => parseInt(s.trim(), 10));
                  return (
                    <>
                      <span className="team" style={{ fontWeight: homeScore > awayScore ? 'bold' : 'normal' }}>{currentGame.home}</span>
                      <span className="score">{currentGame.score}</span>
                      <span className="team" style={{ fontWeight: awayScore > homeScore ? 'bold' : 'normal' }}>{currentGame.away}</span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="matchday-navigation">
              <button
                className="matchday-nav-button prev"
                onClick={() => setGameIdx(idx => Math.max(0, idx - 1))}
                disabled={gameIdx === 0}
              >
                <span className="arrow">←</span> Previous
              </button>
              <span className="matchday-counter">{gameIdx + 1} / {teamGames.length}</span>
              <button
                className="matchday-nav-button next"
                onClick={() => setGameIdx(idx => Math.min(teamGames.length - 1, idx + 1))}
                disabled={gameIdx === teamGames.length - 1}
              >
                Next <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;