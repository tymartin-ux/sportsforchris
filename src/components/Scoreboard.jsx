import { useScoreboard, useAllScoreboards } from '../hooks/useScoreboard';
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

  const getFlag = (c) =>
    c?.athlete?.flag?.href ??
    c?.roster?.athletes?.[0]?.flag?.href ??
    null;

  const getFlagAlt = (c) =>
    c?.athlete?.flag?.alt ??
    c?.roster?.athletes?.[0]?.flag?.alt ??
    '';

  const getSets = (c) => (c?.linescores ?? []).map(ls => ls.value ?? '').join('  ');
  const status = competition.status?.type;
  const isLive = status?.state === 'in';
  const statusLabel = isLive
    ? (status?.shortDetail ?? 'Live')
    : status?.completed
    ? 'Final'
    : competition.date
    ? new Date(competition.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className={`${styles.tennisCard} ${isLive ? styles.tennisLive : ''}`} onClick={onClick}>
      {[away, home].map((c, i) => (
        <div key={i} className={styles.tennisRow}>
          <div className={styles.tennisPlayer}>
            {getFlag(c) && (
              <img src={getFlag(c)} alt={getFlagAlt(c)} className={styles.tennisFlag} />
            )}
            <span className={`${styles.tennisName} ${c?.winner ? styles.tennisWinner : ''}`}>{getName(c)}</span>
          </div>
          <span className={styles.tennisSets}>{getSets(c)}</span>
        </div>
      ))}
      <div className={styles.tennisStatus}>{statusLabel}</div>
    </div>
  );
}

export function AllScoreboard({ date, order, onSelectGame }) {
  const { results, loading, error } = useAllScoreboards(date);

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>;
  if (error) return <div className={styles.center}><p className={styles.error}>Failed to load scores.</p></div>;

  const sorted = order
    ? [...results].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    : results;
  const withGames = sorted.filter(r => r.games.length > 0);
  if (withGames.length === 0) return <div className={styles.center}><p className={styles.empty}>No games scheduled.</p></div>;

  return (
    <div className={styles.tournaments}>
      {withGames.map(({ key, sport, league, label, games, gender }) => {
        if (sport === 'tennis') {
          const dayStart = new Date(date ?? new Date());
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const tournaments = games.map(tournament => {
            const draws = (tournament.groupings ?? []).flatMap(g => {
              const slug = g.grouping?.slug ?? '';
              const isGender = gender === 'mens' ? slug.split('-')[0] === 'mens' : slug.split('-')[0] === 'womens';
              if (!isGender) return [];
              const matches = (g.competitions ?? []).filter(comp => {
                const d = new Date(comp.date ?? comp.startDate);
                return d >= dayStart && d < dayEnd;
              });
              return matches.length > 0 ? [{ ...g, competitions: matches }] : [];
            });
            return { ...tournament, draws };
          }).filter(t => t.draws.length > 0);

          if (tournaments.length === 0) return null;

          return (
            <div key={key} className={styles.tournamentSection}>
              <h2 className={styles.tournamentName}>{label}</h2>
              {tournaments.map(tournament => (
                <div key={tournament.id} className={styles.drawSection}>
                  <div className={styles.drawName}>{tournament.name}</div>
                  {tournament.draws.map(draw => (
                    <div key={draw.grouping.slug}>
                      {(draw.competitions ?? []).map(comp => (
                        <TennisMatchCard
                          key={comp.id}
                          competition={comp}
                          onClick={() => onSelectGame({ id: comp.id, name: comp.notes?.[0]?.text ?? 'Match' }, sport, league)}
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
          <div key={key} className={styles.tournamentSection}>
            <h2 className={styles.tournamentName}>{label}</h2>
            <div className={styles.grid}>
              {sortGames(games).map(event => (
                <ScoreCard key={event.id} event={event} onClick={() => onSelectGame(event, sport, league)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STATE_ORDER = { in: 0, pre: 1, post: 2 };

function sortGames(games) {
  return [...games].sort((a, b) => {
    const aOrder = STATE_ORDER[a.status?.type?.state] ?? 1;
    const bOrder = STATE_ORDER[b.status?.type?.state] ?? 1;
    return aOrder - bOrder;
  });
}

export default function Scoreboard({ sport, league, gender, date, onSelectGame }) {
  const { games, loading, error } = useScoreboard(sport, league, date);

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
    const dayStart = new Date(date ?? new Date());
    dayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(dayStart);
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
          return d >= dayStart && d < todayEnd;
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
      {sortGames(games).map((event) => (
        <ScoreCard key={event.id} event={event} onClick={() => onSelectGame(event)} />
      ))}
    </div>
  );
}
