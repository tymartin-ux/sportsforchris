import { useState } from 'react';
import { SPORTS } from './api/espn';
import SportNav from './components/SportNav';
import Scoreboard from './components/Scoreboard';
import GameDetail from './components/GameDetail';
import styles from './App.module.css';

export default function App() {
  const [selectedSport, setSelectedSport] = useState('NFL');
  const [selectedGame, setSelectedGame] = useState(null);

  const { sport, league } = SPORTS[selectedSport];

  function handleSelectSport(key) {
    setSelectedSport(key);
    setSelectedGame(null);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Scores</h1>
      </header>

      <SportNav selected={selectedSport} onSelect={handleSelectSport} />

      <main>
        <Scoreboard sport={sport} league={league} onSelectGame={setSelectedGame} />
      </main>

      {selectedGame && (
        <GameDetail
          sport={sport}
          league={league}
          event={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
