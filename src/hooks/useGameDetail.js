import { useState, useEffect } from 'react';
import { fetchGameDetail } from '../api/espn';

export function useGameDetail(sport, league, eventId) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchGameDetail(sport, league, eventId)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sport, league, eventId]);

  return { detail, loading, error };
}
