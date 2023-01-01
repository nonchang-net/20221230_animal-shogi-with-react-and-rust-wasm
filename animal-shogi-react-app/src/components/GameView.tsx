/**
 * GameView.tsx
 * - ゲーム状態管理ブロック
 * - 子コンポーネントへの表示指示出しをする
 */

import styles from './GameView.module.css';

import Board from './Board';
import Infomation from './Infomation';

export default () => {


    return (
        <div className={styles.GameView}>
            <div>
                {/* メインの将棋盤 */}
                <Board />
            </div>
            <div>
                {/* 手駒、情報枠 */}
                <Infomation />
            </div>
        </div>
	);
}