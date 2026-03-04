import { useState, useRef, useEffect } from 'react';
import { SPORTS, STANDINGS_STATS } from './api/espn';
import SportNav from './components/SportNav';
import Scoreboard, { AllScoreboard } from './components/Scoreboard';
import Standings from './components/Standings';
import GameDetail from './components/GameDetail';
import styles from './App.module.css';

const SUPPORTS_STANDINGS = new Set(Object.keys(STANDINGS_STATS));

function buildDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (3 - i));
    return d;
  });
}

const DAYS = buildDays();

function DateNav({ selected, onSelect }) {
  const navRef = useRef(null);
  useEffect(() => {
    if (navRef.current) {
      const active = navRef.current.querySelector('[data-today]');
      if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, []);

  return (
    <div className={styles.dateNav} ref={navRef}>
      {DAYS.map((day, i) => {
        const isToday = i === 3;
        const isSelected = day.toDateString() === selected.toDateString();
        return (
          <button
            key={i}
            data-today={isToday ? true : undefined}
            className={`${styles.dateTab} ${isSelected ? styles.dateActive : ''}`}
            onClick={() => onSelect(day)}
          >
            {isToday ? 'Today' : (
              <>
                <span>{day.toLocaleDateString([], { weekday: 'short' })}</span>
                <span>{day.getDate()}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

const DEFAULT_ORDER = Object.keys(SPORTS);

function loadOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem('sportOrder') ?? 'null');
    const allKeys = Object.keys(SPORTS);
    if (Array.isArray(saved) && saved.length === allKeys.length && allKeys.every(k => saved.includes(k))) {
      return saved;
    }
  } catch {}
  return DEFAULT_ORDER;
}

export default function App() {
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(DAYS[3]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sportOrder, setSportOrder] = useState(loadOrder);

  const sportConfig = selectedSport !== 'ALL' ? SPORTS[selectedSport] : null;
  const { sport, league, gender } = sportConfig ?? {};

  function handleSelectSport(key) {
    setSelectedSport(key);
    setSelectedGame(null);
  }

  function handleReorder(newOrder) {
    setSportOrder(newOrder);
    localStorage.setItem('sportOrder', JSON.stringify(newOrder));
  }

  function handleSelectGame(event, gameSport, gameLeague) {
    setSelectedGame({ event, sport: gameSport ?? sport, league: gameLeague ?? league });
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Scores</h1>
      </header>

      <SportNav selected={selectedSport} onSelect={handleSelectSport} order={sportOrder} onReorder={handleReorder} />
      <DateNav selected={selectedDate} onSelect={setSelectedDate} />

      <main>
        {selectedSport === 'ALL'
          ? <AllScoreboard date={selectedDate} order={sportOrder} onSelectGame={handleSelectGame} />
          : <>
              <Scoreboard sport={sport} league={league} gender={gender} date={selectedDate} onSelectGame={(e) => handleSelectGame(e)} />
              {SUPPORTS_STANDINGS.has(league) && <Standings sport={sport} league={league} />}
            </>
        }
      </main>

      {selectedGame && (
        <GameDetail
          sport={selectedGame.sport}
          league={selectedGame.league}
          event={selectedGame.event}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
