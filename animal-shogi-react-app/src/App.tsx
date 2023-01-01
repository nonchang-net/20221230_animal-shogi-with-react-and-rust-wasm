// import React from 'react';
import styles from './css/App.module.css';
import GameView from './components/GameView';


function App() {
  return (
    <div className={styles.App}>
      <header>どうぶつしょうぎ</header>
      <GameView />
    </div>
  );
}


export default App;
