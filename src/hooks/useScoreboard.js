import { useState, useEffect, useCallback } from 'react';
import { fetchScoreboard } from '../api/espn';

export function useScoreboard(sport, league) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchScoreboard(sport, league);
      setGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sport, league]);

  useEffect(() => {
    setLoading(true);
    setGames([]);
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { games, loading, error };
}
