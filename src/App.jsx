


import React from 'react';
import './App.css';

function App() {
  const [page, setPage] = React.useState('home');

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
        <nav className="nav-bar">
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
              <h2 className="section-title" style={{ marginTop: '2.5rem' }}>Standings</h2>
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
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: 500, minWidth: 320 }}>
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
  const [selectedTeam, setSelectedTeam] = React.useState(Array.from(new Set(results.flatMap(r => [r.home, r.away])))[0]);
  const teams = Array.from(new Set(results.flatMap(r => [r.home, r.away])));
  // Add mock matchday data to each result
  const resultsWithMatchday = results.map((r, i) => ({ ...r, matchday: i + 1 }));
  const teamGames = resultsWithMatchday.filter(r => r.home === selectedTeam || r.away === selectedTeam);
  const [gameIdx, setGameIdx] = React.useState(0);

  // Reset gameIdx if team changes
  React.useEffect(() => { setGameIdx(0); }, [selectedTeam]);

  const currentGame = teamGames[gameIdx];

  return (
    <>
      <h2 className="section-title">Results by Team</h2>
      {/* Team selection horizontal row */}
      <div style={{ marginBottom: 0, display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, width: '100%' }}>
        {teams.map(team => (
          <button
            key={team}
            className={team === selectedTeam ? 'nav-link active' : 'nav-link'}
            style={{
              minWidth: 120,
              margin: 0,
              cursor: 'pointer',
              display: 'block',
              fontWeight: team === selectedTeam ? 'bold' : 'normal',
              border: team === selectedTeam ? '2px solid #0074D9' : '1px solid #ccc',
              background: team === selectedTeam ? '#e6f0fa' : '#fff',
              color: '#222',
              borderRadius: 6,
              padding: '0.4rem 1rem',
              boxShadow: team === selectedTeam ? '0 2px 8px #0074d933' : 'none',
              fontSize: 18,
              transition: 'background 0.2s, border 0.2s',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setSelectedTeam(team)}
          >
            {team}
          </button>
        ))}
      </div>
      {/* Centered Matchday box below team selection */}
      {teamGames.length === 0 ? (
        <div style={{ marginTop: '1.5rem' }}>No games found for {selectedTeam}.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: 500, minWidth: 320, background: '#fff', border: '2px solid #0074D9', borderRadius: 12, boxShadow: '0 2px 12px #0074d922', margin: '1.5rem 0 16px 0', padding: '1.5rem 1.5rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {/* Header with matchday, date, and team name */}
            <div style={{ marginBottom: 16, borderBottom: '1px solid #e0e0e0', paddingBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>Matchday {currentGame.matchday}</div>
              <div style={{ fontSize: 16, color: '#0074D9', marginBottom: 2 }}>{currentGame.date}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>{selectedTeam}</div>
            </div>
            <div className="event-card" style={{ marginBottom: 16, minHeight: 70, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                className="nav-link"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', border: '2px solid #0074D9', background: '#e6f0fa', color: '#0074D9', borderRadius: 6, padding: '0.3rem 1rem', opacity: gameIdx === 0 ? 0.5 : 1, transition: 'background 0.2s, border 0.2s' }}
                onClick={() => setGameIdx(idx => Math.max(0, idx - 1))}
                disabled={gameIdx === 0}
              >
                <span style={{ fontSize: 18, marginRight: 6 }}>←</span> Previous
              </button>
              <span style={{ alignSelf: 'center' }}>{gameIdx + 1} / {teamGames.length}</span>
              <button
                className="nav-link"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', border: '2px solid #0074D9', background: '#e6f0fa', color: '#0074D9', borderRadius: 6, padding: '0.3rem 1rem', opacity: gameIdx === teamGames.length - 1 ? 0.5 : 1, transition: 'background 0.2s, border 0.2s' }}
                onClick={() => setGameIdx(idx => Math.min(teamGames.length - 1, idx + 1))}
                disabled={gameIdx === teamGames.length - 1}
              >
                Next <span style={{ fontSize: 18, marginLeft: 6 }}>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;