import styles from './Infomation.module.css';
import Cell from './Cell';
import { Side, Koma } from '../data/Constants';
import { BoardEvaluateData, EvaluateState } from '../data/BoardEvaluateData';

interface IProps {
	tegomaSideA: Array<Koma>
	tegomaSideB: Array<Koma>
	isTegomaSelected: boolean
	selectedTegomaIndex: number
	onTegomaCellClicked: (index:number) => void
	currentTurn: number
	currentSide: Side
	boardEvaluateData: BoardEvaluateData
}

export default function Infomation(props: IProps) {

	const renderTegomas = (renderSide:Side) => {
		let tegomas: Array<Koma>

		if(renderSide === Side.A){
			tegomas=props.tegomaSideA
		}else{
			tegomas=props.tegomaSideB
		}

		if(tegomas.length === 0){
			return <>手駒なし</>;
		}

        const elements:Array<JSX.Element> = [];
		for(let i=0; i<tegomas.length ; i++){

			// フラグ評価
			let selectable = renderSide === Side.A
			let selected = renderSide === Side.A && props.isTegomaSelected && props.selectedTegomaIndex===i
			
			// 自分のターンでない場合は選択状態を解除しておく
			if(props.currentSide !== Side.A){
				selectable = false
				selected = false
			}

			elements.push(<Cell
				key={i}
				selectable={selectable}
				selected={selected}
				movable={false}
				cellData={{ side: renderSide, koma: tegomas[i] }}
				cellIndex={{ x: -1, y: -1 }}
				onClicked={() => {props.onTegomaCellClicked(i)}} />)
		}
		return elements;
	}

	return (
		<div className={styles.infomation}>
			<div>相手の持ち駒</div>
			<div className={styles.motigoma}>
				{renderTegomas(Side.B)}
			</div>
			<div>あなたの持ち駒</div>
			<div className={styles.motigoma}>
				{renderTegomas(Side.A)}
			</div>
		</div>
	);
}