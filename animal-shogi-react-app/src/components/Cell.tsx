import styles from './Cell.module.css';
// import {ICellData, Koma, Side} from './GameView';

import {Position} from '../Utils'
import {Side, Koma} from '../data/Constants';
import {CellData} from '../data/CellData';
import {BoardData} from '../data/BoardData';

interface IProps{
	cellData: CellData,
	cellIndex: {x:number, y:number}
	boardData: BoardData,
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

	const enableMove = ():boolean=>{
		// 自陣でなければ操作対象ではない
		// console.log("enableMove? props.cellIndex",props.cellIndex)
		if(props.cellData.side !== Side.A){
			// console.log("enableMove? サイドがAじゃなかった")
			return false;
		}

		// 移動できるセルがなければ操作対象ではない
		var enableMove = false;
		for(const move of props.boardData.Sides[Side.A].enableMoves){
			// console.log("enableMove? 評価:", move, props.cellIndex)
			if(move.from.x == props.cellIndex.x && move.from.y == props.cellIndex.y){
				enableMove=true;
				break;
			}
		}
		
		// console.log("enableMove?",enableMove, props.boardData.Sides[Side.A])
		// if(enableMove){
		// 	console.error("enableMove!",enableMove, props.boardData.Sides[Side.A])
		// }else{
		// 	console.log("enableMove? 何も見つからんかった……？")
		// }
		return enableMove;
	}

	// console.log("enableMove check: ",props.cellData.side, props.cellIndex.x, props.cellIndex.y)

	return (
		<div className={`
			${styles.cell}
			${enableMove() ? styles.selectable : ""}
			${props.cellData.side === Side.B ? styles.invert : ""}
			${props.cellData.koma === Koma.NULL ? styles.empty : ""}
		`} onClick={()=>{props.onClicked()}}>
			{komaChara()}
		</div>
	);
}