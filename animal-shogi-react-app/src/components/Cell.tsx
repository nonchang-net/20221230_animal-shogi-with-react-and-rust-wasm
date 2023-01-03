import styles from './Cell.module.css';
// import {ICellData, Koma, Side} from './GameView';

import {Side, Koma} from '../data/Constants';
import {CellData} from '../data/CellData';

interface IProps{
	cellData: CellData,
	onClicked: () => void

}

export default function Cell (props: IProps){

    const komaChara = ()=>{
        switch(props.cellData.koma){
            case Koma.Hiyoko:
                return (<>🐥</>);
            case Koma.Kirin:
                return (<>🦒</>);
            case Koma.Lion:
                return (<>🦁</>);
            case Koma.Zou:
                return (<>🐘</>);
            case Koma.Niwatori:
                return (<>🐔</>);
            case Koma.NULL:
            default:
                return (<></>);                
        }
    }

    return (
        <div className={`
            ${styles.cell}
            ${props.cellData.side === Side.A ? styles.selectable : ""}
            ${props.cellData.side === Side.B ? styles.invert : ""}
            ${props.cellData.koma === Koma.NULL ? styles.empty : ""}
        `} onClick={()=>{props.onClicked()}}>
            {komaChara()}
        </div>
	);
}