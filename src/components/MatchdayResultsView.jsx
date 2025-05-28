import React, { useState } from 'react';
import { getUniqueGames } from '../utils';

function MatchdayResultsView({ results, matchdays }) {
  const filteredMatchdays = matchdays.filter(md => md && typeof md.startDate === 'string');
  const sortedMatchdays = [...filteredMatchdays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedMatchday = sortedMatchdays[selectedIdx] || null;

  // Group results by matchdayId and sort by date within each matchday
  const grouped = {};
  results.forEach(r => {
    if (!grouped[r.matchdayId]) grouped[r.matchdayId] = [];
    grouped[r.matchdayId].push(r);
  });
  Object.values(grouped).forEach(arr => arr.sort((a, b) => (a.date || '').localeCompare(b.date || '')));

  // Navigation handlers
  const prevMatchday = () => setSelectedIdx(idx => Math.max(0, idx - 1));
  const nextMatchday = () => setSelectedIdx(idx => Math.min(sortedMatchdays.length - 1, idx + 1));

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
                {getUniqueGames(grouped[selectedMatchday.id] || []).length === 0 ? (
                  <div className="no-games-message">No results for this matchday.</div>
                ) : (
                  getUniqueGames(grouped[selectedMatchday.id] || []).map((event, idx) => {
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
    </>
  );
}

export default MatchdayResultsView;
