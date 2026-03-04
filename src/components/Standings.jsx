import { useStandings } from '../hooks/useStandings';
import { STANDINGS_STATS } from '../api/espn';
import styles from './Standings.module.css';

export default function Standings({ sport, league }) {
  const { groups, loading, error } = useStandings(sport, league);
  const cols = STANDINGS_STATS[league] ?? [];

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <span className={styles.error}>{error}</span>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className={styles.center}>
        <span className={styles.empty}>No standings available.</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {groups.map((group, gi) => {
        const entries = [...(group.standings?.entries ?? [])];
        if (league === 'nba' || league === 'mens-college-basketball') entries.reverse();
        return (
          <section key={gi} className={styles.group}>
            <h2 className={styles.groupName}>{group.name}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.teamCol}>Team</th>
                    {cols.map(col => (
                      <th key={col} className={styles.statCol}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, ei) => {
                    const team = entry.team ?? {};
                    const statsMap = {};
                    (entry.stats ?? []).forEach(s => {
                      statsMap[s.abbreviation] = s.displayValue;
                    });
                    return (
                      <tr key={ei}>
                        <td className={styles.teamCell}>
                          {team.logos?.[0]?.href && (
                            <img
                              src={team.logos[0].href}
                              alt=""
                              className={styles.teamLogo}
                            />
                          )}
                          <span className={styles.teamName}>{team.shortDisplayName ?? team.displayName ?? team.name}</span>
                        </td>
                        {cols.map(col => (
                          <td key={col} className={styles.statCell}>
                            {statsMap[col] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
