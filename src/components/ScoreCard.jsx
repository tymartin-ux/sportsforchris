import styles from './ScoreCard.module.css';

function getStatus(event) {
  const status = event.status?.type;
  if (!status) return { label: '', live: false };
  if (status.completed) return { label: 'Final', live: false };
  if (status.state === 'in') {
    return { label: status.shortDetail ?? 'Live', live: true };
  }
  // pre-game: show date/time
  const date = event.date ? new Date(event.date) : null;
  const label = date
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : status.shortDetail ?? '';
  return { label, live: false };
}

function getPitcher(competitor) {
  const probable = competitor?.probables?.[0];
  if (!probable) return null;
  return {
    name: probable.athlete?.shortName ?? probable.athlete?.displayName,
    headshot: probable.athlete?.headshot,
    record: probable.record,
  };
}

export default function ScoreCard({ event, onClick }) {
  const competitors = event.competitions?.[0]?.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === 'home');
  const away = competitors.find((c) => c.homeAway === 'away');
  const { label: statusLabel, live } = getStatus(event);
  const status = event.status?.type;
  const awayPitcher = getPitcher(away);
  const homePitcher = getPitcher(home);
  const hasPitchers = awayPitcher || homePitcher;

  return (
    <div className={`${styles.card} ${live ? styles.live : ''}`} onClick={onClick}>
      {live && <span className={styles.liveDot}>LIVE</span>}

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

      {hasPitchers && (
        <div className={styles.pitchers}>
          {[awayPitcher, homePitcher].map((p, i) => p && (
            <div key={i} className={styles.pitcher}>
              {p.headshot && <img src={p.headshot} alt={p.name} className={styles.pitcherHeadshot} />}
              <span className={styles.pitcherName}>{p.name}</span>
              {p.record && <span className={styles.pitcherRecord}>{p.record}</span>}
            </div>
          ))}
        </div>
      )}

      <div className={styles.status}>{statusLabel}</div>
    </div>
  );
}
