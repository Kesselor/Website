import React, { useState } from 'react';
import { getUniqueGames } from '../utils';

function TeamResultsView({ results, matchdays }) {
  const filteredMatchdays = matchdays.filter(md => md && typeof md.startDate === 'string');
  const sortedMatchdays = [...filteredMatchdays].sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Group results by matchdayId
  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.matchdayId]) grouped[r.matchdayId] = [];
    grouped[r.matchdayId].push(r);
  });
  // Sort games within each matchday by date (though less critical here as we filter by team)
  Object.values(grouped).forEach(arr => arr.sort((a, b) => (a.date || '').localeCompare(b.date || '')));


  // --- Team filter state and logic ---
  // Get all unique teams from results
  const allTeams = Array.from(new Set(results.flatMap(r => [r.home, r.away]))).sort();
  const [selectedTeam, setSelectedTeam] = useState(allTeams[0] || '');

  // All results for selected team, grouped by matchday
  const teamResultsByMatchday = sortedMatchdays.map(md => {
    const games = getUniqueGames((grouped[md.id] || []).filter(r => r.home === selectedTeam || r.away === selectedTeam));
    return { matchday: md, games };
  });

  return (
    <>
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

export default TeamResultsView;
