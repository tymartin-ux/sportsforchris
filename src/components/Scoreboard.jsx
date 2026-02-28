import { useScoreboard } from '../hooks/useScoreboard';
import ScoreCard from './ScoreCard';
import styles from './Scoreboard.module.css';

function TennisMatchCard({ competition, onClick }) {
  const away = competition.competitors?.find(c => c.homeAway === 'away');
  const home = competition.competitors?.find(c => c.homeAway === 'home');
  const getName = (c) =>
    c?.athlete?.shortName ??
    c?.athlete?.displayName ??
    c?.roster?.shortDisplayName ??
    c?.roster?.displayName ??
    '—';
  const getSets = (c) => (c?.linescores ?? []).map(ls => ls.value ?? '').join('  ');
  const status = competition.status?.type;
  const isLive = status?.state === 'in';
  const statusLabel = isLive
    ? (competition.status?.displayClock ?? 'Live')
    : status?.completed
    ? 'Final'
    : competition.status?.displayClock ?? '—';

  return (
    <div className={`${styles.tennisCard} ${isLive ? styles.tennisLive : ''}`} onClick={onClick}>
      {isLive && <span className={styles.tennisLiveDot} />}
      <div className={styles.tennisRow}>
        <span className={`${styles.tennisName} ${away?.winner ? styles.tennisWinner : ''}`}>{getName(away)}</span>
        <span className={styles.tennisSets}>{getSets(away)}</span>
      </div>
      <div className={styles.tennisRow}>
        <span className={`${styles.tennisName} ${home?.winner ? styles.tennisWinner : ''}`}>{getName(home)}</span>
        <span className={styles.tennisSets}>{getSets(home)}</span>
      </div>
      <div className={styles.tennisStatus}>{statusLabel}</div>
    </div>
  );
}

export default function Scoreboard({ sport, league, gender, onSelectGame }) {
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

  if (sport === 'tennis') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const tournaments = games.map(tournament => {
      const draws = (tournament.groupings ?? []).flatMap(g => {
        const slug = g.grouping?.slug ?? '';
        const isGender = gender === 'mens'
          ? slug.split('-')[0] === 'mens'
          : slug.split('-')[0] === 'womens';
        if (!isGender) return [];
        const matches = (g.competitions ?? []).filter(comp => {
          const d = new Date(comp.date ?? comp.startDate);
          return d >= todayStart && d < todayEnd;
        });
        return matches.length > 0 ? [{ ...g, competitions: matches }] : [];
      });
      return { ...tournament, draws };
    }).filter(t => t.draws.length > 0);

    if (tournaments.length === 0) {
      return <div className={styles.center}><p className={styles.empty}>No matches scheduled today.</p></div>;
    }

    return (
      <div className={styles.tournaments}>
        {tournaments.map(tournament => (
          <div key={tournament.id} className={styles.tournamentSection}>
            <h2 className={styles.tournamentName}>{tournament.name}</h2>
            {tournament.draws.map(draw => (
              <div key={draw.grouping.slug} className={styles.drawSection}>
                <div className={styles.drawName}>{draw.grouping.displayName}</div>
                {(draw.competitions ?? []).map(comp => (
                  <TennisMatchCard
                    key={comp.id}
                    competition={comp}
                    onClick={() => onSelectGame({ id: comp.id, name: comp.notes?.[0]?.text ?? 'Match' })}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {games.map((event) => (
        <ScoreCard key={event.id} event={event} onClick={() => onSelectGame(event)} />
      ))}
    </div>
  );
}
