import { useScoreboard } from '../hooks/useScoreboard';
import ScoreCard from './ScoreCard';
import styles from './Scoreboard.module.css';

export default function Scoreboard({ sport, league, onSelectGame }) {
  const { games, loading, error } = useScoreboard(sport, league);

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.center}><p className={styles.error}>Failed to load scores: {error}</p></div>;
  }

  if (games.length === 0) {
    return <div className={styles.center}><p className={styles.empty}>No games scheduled today.</p></div>;
  }

  return (
    <div className={styles.grid}>
      {games.map((event) => (
        <ScoreCard key={event.id} event={event} onClick={() => onSelectGame(event)} />
      ))}
    </div>
  );
}
