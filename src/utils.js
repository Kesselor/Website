export function getUniqueGames(gamesArray) {
  if (!gamesArray || !Array.isArray(gamesArray)) {
    return [];
  }
  return gamesArray.filter((event, idx, arr2) =>
    arr2.findIndex(e =>
      e.home === event.home &&
      e.away === event.away &&
      e.date === event.date &&
      e.league === event.league
    ) === idx
  );
}

export function calculateStandings(teamsArr, resultsArr) {
  // Only include league games
  const leagueResults = resultsArr.filter(r => r.league === 'League Game');
  // Filter out duplicate games
  const uniqueLeagueResults = getUniqueGames(leagueResults);
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

export function getDynamicHighlights(standings, results) {
  // Only count league games
  const leagueResults = results.filter(r => r.league === 'League Game');
  // Get unique games
  const uniqueGames = getUniqueGames(leagueResults);
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
    // Find current streak (W/D/L) from most recent backwards
    for (let i = games.length - 1; i >= 0; i--) {
      const g = games[i];
      const isHome = g.home === team;
      const [homeScore, awayScore] = g.score.split(':').map(s => parseInt(s.trim(), 10));
      let result = 'D';
      if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) result = 'W';
      else if ((isHome && homeScore < awayScore) || (!isHome && awayScore < homeScore)) result = 'L';
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
