import { SPORTS } from '../api/espn';
import styles from './SportNav.module.css';

export default function SportNav({ selected, onSelect }) {
  return (
    <nav className={styles.nav}>
      {Object.entries(SPORTS).map(([key, { label }]) => (
        <button
          key={key}
          className={`${styles.tab} ${selected === key ? styles.active : ''}`}
          onClick={() => onSelect(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
