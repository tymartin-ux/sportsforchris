import { useState, useEffect } from 'react';
import { fetchStandings } from '../api/espn';

export function useStandings(sport, league) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sport || !league) return;
    setLoading(true);
    setError(null);
    fetchStandings(sport, league)
      .then(setGroups)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sport, league]);

  return { groups, loading, error };
}
