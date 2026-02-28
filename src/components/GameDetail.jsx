import { useGameDetail } from '../hooks/useGameDetail';
import styles from './GameDetail.module.css';

export default function GameDetail({ sport, league, event, onClose }) {
  const { detail, loading, error } = useGameDetail(sport, league, event?.id);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>

        <h2 className={styles.title}>{event?.name ?? 'Game Detail'}</h2>

        {loading && <div className={styles.spinner} />}
        {error && <p className={styles.error}>Failed to load details: {error}</p>}

        {detail && !loading && (
          <>
            <LinescoreTable detail={detail} />
            <BoxscoreTable detail={detail} />
            <KeyStats detail={detail} />
          </>
        )}
      </div>
    </div>
  );
}

function LinescoreTable({ detail }) {
  const linescore = detail?.header?.competitions?.[0]?.competitors;
  if (!linescore) return null;

  const periods = linescore[0]?.linescores ?? [];
  if (periods.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Linescore</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Team</th>
              {periods.map((_, i) => <th key={i}>{i + 1}</th>)}
              <th>T</th>
            </tr>
          </thead>
          <tbody>
            {linescore.map((team) => (
              <tr key={team.id}>
                <td>{team.team?.abbreviation ?? team.team?.name}</td>
                {(team.linescores ?? []).map((ls, i) => (
                  <td key={i}>{ls.value ?? ls.displayValue ?? '—'}</td>
                ))}
                <td><strong>{team.score}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoxscoreTable({ detail }) {
  const teams = detail?.boxscore?.players;
  if (!teams || teams.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Box Score</h3>
      {teams.map((team, i) => {
        const stats = team.statistics?.[0];
        if (!stats) return null;
        const headers = stats.names ?? [];
        const athletes = (stats.athletes ?? []).filter(a => !a.didNotPlay);
        return (
          <div key={i} className={styles.boxTeam}>
            <div className={styles.boxTeamName}>{team.team?.displayName}</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Player</th>
                    {headers.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, j) => (
                    <tr key={j} className={a.athlete?.starter ? styles.starter : ''}>
                      <td>{a.athlete?.shortName ?? a.athlete?.displayName}</td>
                      {(a.stats ?? []).map((s, k) => <td key={k}>{s}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KeyStats({ detail }) {
  const leaders = detail?.leaders;
  if (!leaders || leaders.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Leaders</h3>
      <div className={styles.statsGrid}>
        {leaders.map((category) => {
          const leader = category.leaders?.[0];
          if (!leader) return null;
          return (
            <div key={category.name} className={styles.statCard}>
              <div className={styles.statLabel}>{category.displayName}</div>
              <div className={styles.statAthlete}>{leader.athlete?.displayName ?? '—'}</div>
              <div className={styles.statValue}>{leader.displayValue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
