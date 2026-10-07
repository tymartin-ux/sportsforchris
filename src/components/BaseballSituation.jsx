import styles from './BaseballSituation.module.css';

// Bases diamond, ball-strike count and outs for a live baseball game
export default function BaseballSituation({ bases, balls, strikes, outs, large }) {
  const [first, second, third] = bases;
  const base = (on) => (on ? styles.baseOn : styles.baseOff);

  return (
    <div className={`${styles.situation} ${large ? styles.large : ''}`}>
      <svg className={styles.diamond} viewBox="0 0 32 22" aria-label="Runners on base">
        <rect className={base(second)} x="11.5" y="1.5" width="9" height="9" transform="rotate(45 16 6)" />
        <rect className={base(third)} x="2.5" y="10.5" width="9" height="9" transform="rotate(45 7 15)" />
        <rect className={base(first)} x="20.5" y="10.5" width="9" height="9" transform="rotate(45 25 15)" />
      </svg>
      <span className={styles.count}>{balls ?? 0}-{strikes ?? 0}</span>
      <span className={styles.outs} aria-label={`${outs ?? 0} outs`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`${styles.out} ${i < (outs ?? 0) ? styles.outOn : ''}`} />
        ))}
      </span>
    </div>
  );
}
