// import React from 'react';
import styles from './css/App.module.css';

import Board from './components/Board';
import Infomation from './components/Infomation';

import {GameData} from './data/GameData'

import Utils from './Utils'

export default function App() {

	const gameData = new GameData();

    // ちょっとテスト
    // for(let i=0 ; i<10 ; i++){
    //     // console.log("randtest:",Utils.getRandomKoma())
	// 	console.log("TEST_getRandomCell():", Utils.TEST_getRandomCell(gameData.currentBoardData))
    // }

	return (
		<div className={styles.App}>
			<header>どうぶつしょうぎ</header>
			<div className={styles.GameView}>
				<div>
					{/* メインの将棋盤 */}
					<Board data={gameData}/>
					{/* <Board data={{data:123}}/> */}
				</div>
				<div>
					{/* 手駒、情報枠 */}
					<Infomation data={gameData}/>
				</div>
			</div>
		</div>
	);
}

