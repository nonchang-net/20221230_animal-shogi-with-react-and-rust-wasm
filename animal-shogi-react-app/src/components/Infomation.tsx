import styles from './Infomation.module.css';
import Cell from './Cell';
import { Koma, Side } from './GameView';

export default ()=>{
	return (
        <div className={styles.infomation}>
          <div>相手の持ち駒</div>
            <div className={styles.motigoma}>
                <Cell cellData={{side:Side.B, koma:Koma.Hiyoko}} />
            </div>
          <div>あなたの持ち駒</div>
            <div className={styles.motigoma}>
                <Cell cellData={{side:Side.A, koma:Koma.Hiyoko}} />
            </div>
          <div className={styles.header}>testtest<br /> testtest2</div>
        </div>
	);
}