export const SPORTS = {
  NFL: { sport: 'football', league: 'nfl', label: 'NFL' },
  NBA: { sport: 'basketball', league: 'nba', label: 'NBA' },
  MLB: { sport: 'baseball', league: 'mlb', label: 'MLB' },
  NHL: { sport: 'hockey', league: 'nhl', label: 'NHL' },
  MLS: { sport: 'soccer', league: 'usa.1', label: 'MLS' },
  EPL: { sport: 'soccer', league: 'eng.1', label: 'Premier League' },
  NCAAF: { sport: 'football', league: 'college-football', label: 'NCAAF' },
  NCAAB: { sport: 'basketball', league: 'mens-college-basketball', label: 'NCAAB' },
  MENS_TENNIS: { sport: 'tennis', league: 'atp', label: 'Mens Tennis', gender: 'mens' },
  WOMENS_TENNIS: { sport: 'tennis', league: 'wta', label: 'Womens Tennis', gender: 'womens' },
};

const BASE = 'https://site.api.espn.com/apis/site/v2/sports';

export async function fetchScoreboard(sport, league) {
  const res = await fetch(`${BASE}/${sport}/${league}/scoreboard`);
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  const data = await res.json();
  return data.events ?? [];
}

export async function fetchGameDetail(sport, league, eventId) {
  const res = await fetch(`${BASE}/${sport}/${league}/summary?event=${eventId}`);
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  return res.json();
}
