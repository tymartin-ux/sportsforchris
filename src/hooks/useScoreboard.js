import { useState, useEffect, useCallback } from 'react';
import { fetchScoreboard, SPORTS } from '../api/espn';

export function useScoreboard(sport, league, date) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchScoreboard(sport, league, date);
      setGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sport, league, date]);

  useEffect(() => {
    setLoading(true);
    setGames([]);
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { games, loading, error };
}

export function useAllScoreboards(date) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const entries = Object.entries(SPORTS);
      const fetches = entries.map(([key, { sport, league, label, gender }]) =>
        fetchScoreboard(sport, league, date)
          .then(games => ({ key, sport, league, label, gender, games }))
          .catch(() => ({ key, sport, league, label, gender, games: [] }))
      );
      setResults(await Promise.all(fetches));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    setResults([]);
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { results, loading, error };
}
