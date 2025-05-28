import React from 'react';
import { getUniqueGames } from '../utils';

function LatestResults({ results, matchdays }) {
  if (!results.length || !matchdays.length) return null;

  // Only league games
  const leagueResults = results.filter(r => r.league === 'League Game');
  // Get unique games
  const uniqueGames = getUniqueGames(leagueResults);

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
  const latestResultsForMatchday = uniqueGames.filter(r => r.matchdayId === latestMatchday.id); // This uniqueGames is from getUniqueGames(leagueResults)

  if (!latestResultsForMatchday.length) return <div className="no-games-message">No results for latest matchday.</div>;

  return latestResultsForMatchday.map((event, idx) => {
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
}

export default LatestResults;
