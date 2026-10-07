import { useGameDetail } from '../hooks/useGameDetail';
import BaseballSituation from './BaseballSituation';
import styles from './GameDetail.module.css';

export default function GameDetail({ sport, league, event, onClose }) {
  const { detail, loading, error } = useGameDetail(sport, league, event?.id);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>

        <h2 className={styles.title}>{event?.name ?? 'Game Detail'}</h2>

        {loading && <div className={styles.spinner} />}

        {detail && !loading && (
          <>
            {sport === 'baseball' && <LiveBaseball detail={detail} />}
            <LinescoreTable detail={detail} />
            <BoxscoreTable detail={detail} />
            <KeyStats detail={detail} />
          </>
        )}
      </div>
    </div>
  );
}

// Name, headshot and today's stat line for everyone in the lineups and box score
function buildAthleteMap(detail) {
  const map = {};
  for (const team of detail?.rosters ?? []) {
    for (const entry of team.roster ?? []) {
      const a = entry.athlete;
      if (a?.id) map[a.id] = { name: a.shortName ?? a.displayName, headshot: a.headshot?.href };
    }
  }
  for (const team of detail?.boxscore?.players ?? []) {
    for (const group of team.statistics ?? []) {
      const labels = group.labels ?? group.names ?? [];
      const stat = (row, label) => row.stats?.[labels.indexOf(label)];
      for (const row of group.athletes ?? []) {
        const a = row.athlete;
        if (!a?.id) continue;
        const line = group.type === 'pitching'
          ? [['IP', 'IP'], ['ER', 'ER'], ['K', 'K'], ['PC', 'P']]
              .filter(([label]) => stat(row, label) != null)
              .map(([label, suffix]) => `${stat(row, label)} ${suffix}`)
              .join(', ')
          : stat(row, 'H-AB');
        map[a.id] = {
          name: a.shortName ?? a.displayName,
          headshot: a.headshot?.href,
          ...map[a.id],
          [group.type === 'pitching' ? 'pitchingLine' : 'battingLine']: line,
        };
      }
    }
  }
  return map;
}

function LiveBaseball({ detail }) {
  const status = detail?.header?.competitions?.[0]?.status;
  const situation = detail?.situation;
  if (status?.type?.state !== 'in' || !situation) return null;

  const plays = detail.plays ?? [];
  const lastPlay = plays[plays.length - 1];
  const athletes = buildAthleteMap(detail);
  const bases = ['onFirst', 'onSecond', 'onThird'].map((k) => Boolean(situation[k] ?? lastPlay?.[k]));

  const batter = athletes[situation.batter?.playerId];
  const pitcher = athletes[situation.pitcher?.playerId];
  const atBatPlays = situation.batter && lastPlay
    ? plays.filter((p) => p.atBatId === lastPlay.atBatId)
    : [];
  const pitches = atBatPlays.filter((p) => /^Pitch \d+ : /.test(p.text ?? ''));
  const lastResult = [...plays].reverse().find((p) => p.type?.type === 'play-result');
  const dueUp = (situation.dueUp ?? []).map((d) => athletes[d.playerId]).filter(Boolean);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Live</h3>
      <div className={styles.liveBox}>
        <div className={styles.liveHeader}>
          <span className={styles.liveInning}>{status.type.detail ?? status.type.shortDetail}</span>
          <BaseballSituation
            large
            bases={bases}
            balls={situation.balls}
            strikes={situation.strikes}
            outs={situation.outs}
          />
        </div>

        {(batter || pitcher) && (
          <div className={styles.matchup}>
            <MatchupPlayer label="At bat" player={batter} line={batter?.battingLine} />
            <MatchupPlayer label="Pitching" player={pitcher} line={pitcher?.pitchingLine} />
          </div>
        )}

        {pitches.length > 0 && (
          <ol className={styles.pitchList}>
            {pitches.map((p, i) => (
              <li key={p.id} className={styles.pitch}>
                <span className={styles.pitchNum}>{i + 1}</span>
                <span className={styles.pitchResult}>{p.text.replace(/^Pitch \d+ : /, '')}</span>
                <span className={styles.pitchType}>
                  {[p.pitchType?.text, p.pitchVelocity && `${p.pitchVelocity} mph`].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ol>
        )}

        {dueUp.length > 0 && (
          <div className={styles.liveNote}>
            <span className={styles.liveNoteLabel}>Due up</span>
            {dueUp.map((a) => a.name).join(', ')}
          </div>
        )}

        {lastResult?.text && (
          <div className={styles.liveNote}>
            <span className={styles.liveNoteLabel}>Last play</span>
            {lastResult.text}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchupPlayer({ label, player, line }) {
  if (!player) return <div className={styles.matchupPlayer} />;
  return (
    <div className={styles.matchupPlayer}>
      {player.headshot && <img src={player.headshot} alt={player.name} className={styles.matchupHeadshot} />}
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statAthlete}>{player.name}</div>
        {line && <div className={styles.statValue}>{line}</div>}
      </div>
    </div>
  );
}

function LinescoreTable({ detail }) {
  const competitors = detail?.header?.competitions?.[0]?.competitors;
  if (!competitors) return null;
  // Away team on top, matching the score cards
  const linescore = [...competitors].sort((a, b) => (a.homeAway === 'home') - (b.homeAway === 'home'));

  // Teams can have different inning counts (e.g. the top of an inning in baseball)
  const periodCount = Math.max(...linescore.map((team) => team.linescores?.length ?? 0));
  if (periodCount === 0) return null;
  const periods = Array.from({ length: periodCount });

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
                {periods.map((_, i) => {
                  const ls = team.linescores?.[i];
                  return <td key={i}>{ls ? ls.value ?? ls.displayValue ?? '—' : ''}</td>;
                })}
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
      {teams.map((team, i) => (
        <div key={i} className={styles.boxTeam}>
          <div className={styles.boxTeamName}>{team.team?.displayName}</div>
          {(team.statistics ?? []).map((stats, si) => {
            // Football/hockey send `labels` + `name`; basketball/baseball send `names` + `type`
            const headers = stats.labels ?? stats.names ?? [];
            const group = stats.type ?? stats.name;
            const athletes = (stats.athletes ?? []).filter(a => !a.didNotPlay);
            if (athletes.length === 0) return null;
            return (
              <div key={si}>
                {group && (
                  <div className={styles.boxStatType}>
                    {group.replace(/([a-z])([A-Z])/g, '$1 $2')}
                  </div>
                )}
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
      ))}
    </div>
  );
}

function KeyStats({ detail }) {
  const leaders = detail?.leaders;
  if (!leaders || leaders.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Leaders</h3>
      {leaders.map((teamEntry, i) => {
        const categories = teamEntry.leaders ?? [];
        if (categories.length === 0) return null;
        return (
          <div key={i} className={styles.boxTeam}>
            <div className={styles.boxTeamName}>{teamEntry.team?.displayName}</div>
            <div className={styles.statsGrid}>
              {categories.map((category) => {
                const leader = category.leaders?.[0];
                if (!leader) return null;
                return (
                  <div key={category.name} className={styles.statCard}>
                    <div className={styles.statLabel}>{category.displayName}</div>
                    <div className={styles.statAthlete}>
                      {leader.athlete?.shortName ?? leader.athlete?.displayName ?? '—'}
                    </div>
                    <div className={styles.statValue}>
                      {leader.mainStat?.value} {leader.mainStat?.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
