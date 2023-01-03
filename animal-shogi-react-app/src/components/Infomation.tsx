import styles from './Infomation.module.css';
import Cell from './Cell';
import {Side, Koma} from '../data/Constants';
import {GameData} from '../data/GameData';

interface IProps{
	data: GameData
}

export default function Infomation(props: IProps){

    // const getDummyData1 = (): JSX.Element => {
    //     let result = <></>
    //     result.
    //     return result
    // }

	return (
        <div className={styles.infomation}>
          <div>相手の持ち駒</div>
            <div className={styles.motigoma}>
                <Cell cellData={{side:Side.B, koma:Koma.Hiyoko}} onClicked={()=>{}} />
            </div>
          <div>あなたの持ち駒</div>
            <div className={styles.motigoma}>
                <Cell cellData={{side:Side.A, koma:Koma.Hiyoko}} onClicked={()=>{}} />
            </div>
          <div className={styles.header}>testtest<br /> testtest2</div>
        </div>
	);
}