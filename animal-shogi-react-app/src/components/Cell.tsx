import styles from './Cell.module.css';
import {Side, Koma} from '../data/Constants';

interface IProps{
	selectable: boolean | undefined
	selected: boolean | undefined
	movable: boolean | undefined
	cellData: CellData
	cellIndex: {x:number, y:number}
	onClicked: () => void
}

export type CellData={
    side: Side;
    koma: Koma;
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
			${props.selectable ? styles.selectable : ""}
			${props.selected ? styles.selected : ""}
			${props.movable ? styles.movable : ""}
			${props.cellData.side === Side.B ? styles.invert : ""}
			${props.cellData.koma === Koma.NULL ? styles.empty : ""}
		`} onClick={()=>{props.onClicked()}}>
			{komaChara()}
		</div>
	);
}