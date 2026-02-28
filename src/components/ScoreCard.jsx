import styles from './ScoreCard.module.css';

function getStatus(event) {
  const status = event.status?.type;
  if (!status) return { label: '', live: false };
  if (status.completed) return { label: 'Final', live: false };
  if (status.state === 'in') {
    const detail = event.status?.displayClock
      ? `${event.status.displayClock} · ${status.shortDetail ?? ''}`
      : status.shortDetail ?? 'Live';
    return { label: detail, live: true };
  }
  // pre-game: show date/time
  const date = event.date ? new Date(event.date) : null;
  const label = date
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : status.shortDetail ?? '';
  return { label, live: false };
}

export default function ScoreCard({ event, onClick }) {
  const competitors = event.competitions?.[0]?.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === 'home');
  const away = competitors.find((c) => c.homeAway === 'away');
  const { label: statusLabel, live } = getStatus(event);

  return (
    <div className={`${styles.card} ${live ? styles.live : ''}`} onClick={onClick}>
      {live && <span className={styles.liveDot} />}

      <div className={styles.team}>
        {away?.team?.logo && (
          <img src={away.team.logo} alt={away.team.abbreviation} className={styles.logo} />
        )}
        <span className={styles.teamName}>{away?.team?.shortDisplayName ?? away?.team?.name ?? '—'}</span>
        <span className={styles.score}>{away?.score ?? ''}</span>
      </div>

      <div className={styles.team}>
        {home?.team?.logo && (
          <img src={home.team.logo} alt={home.team.abbreviation} className={styles.logo} />
        )}
        <span className={styles.teamName}>{home?.team?.shortDisplayName ?? home?.team?.name ?? '—'}</span>
        <span className={styles.score}>{home?.score ?? ''}</span>
      </div>

      <div className={styles.status}>{statusLabel}</div>
    </div>
  );
}
