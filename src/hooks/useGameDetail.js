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

  // Keep a live game current without flashing the loading spinner
  const isLive = detail?.header?.competitions?.[0]?.status?.type?.state === 'in';
  useEffect(() => {
    if (!eventId || !isLive) return;
    const interval = setInterval(() => {
      fetchGameDetail(sport, league, eventId).then(setDetail).catch(() => {});
    }, 10_000);
    return () => clearInterval(interval);
  }, [sport, league, eventId, isLive]);

  return { detail, loading, error };
}
