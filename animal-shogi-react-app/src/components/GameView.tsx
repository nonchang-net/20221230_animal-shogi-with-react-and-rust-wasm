/**
 * GameView.tsx
 * - ゲーム状態管理ブロック
 * - 子コンポーネントへの表示指示出しをする
 */

import styles from './GameView.module.css';

import Board from './Board';
import Infomation from './Infomation';

import {GameData} from '../data/GameData'

export default function GameView(){

    const gameData = new GameData();

    return (
        <div className={styles.GameView}>
            <div>
                {/* メインの将棋盤 */}
                <Board data={gameData.currentBoardData}/>
                {/* <Board data={{data:123}}/> */}
            </div>
            <div>
                {/* 手駒、情報枠 */}
                <Infomation data={gameData}/>
            </div>
        </div>
	);
}