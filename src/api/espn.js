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
  WBC: { sport: 'baseball', league: 'world-baseball-classic', label: 'WBC' },
};

const BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const STANDINGS_BASE = 'https://site.web.api.espn.com/apis/v2/sports';

export const STANDINGS_STATS = {
  nfl: ['W', 'L', 'T', 'PCT', 'GB'],
  nba: ['W', 'L', 'PCT', 'GB'],
  mlb: ['W', 'L', 'PCT', 'GB'],
  nhl: ['PTS', 'GP', 'W', 'L', 'OTL'],
  'usa.1': ['P', 'W', 'D', 'L', 'GD', 'GP'],
  'eng.1': ['P', 'W', 'D', 'L', 'GD', 'GP'],
  'college-football': ['W', 'L', 'PCT'],
  'mens-college-basketball': ['W', 'L', 'PCT', 'GB'],
};

function toESPNDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export async function fetchScoreboard(sport, league, date) {
  const dateParam = date ? `?dates=${toESPNDate(date)}` : '';
  const res = await fetch(`${BASE}/${sport}/${league}/scoreboard${dateParam}`);
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  const data = await res.json();
  return data.events ?? [];
}

export async function fetchStandings(sport, league) {
  const res = await fetch(`${STANDINGS_BASE}/${sport}/${league}/standings`);
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  const data = await res.json();
  return data.children ?? [];
}

export async function fetchGameDetail(sport, league, eventId) {
  const res = await fetch(`${BASE}/${sport}/${league}/summary?event=${eventId}`);
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  return res.json();
}
