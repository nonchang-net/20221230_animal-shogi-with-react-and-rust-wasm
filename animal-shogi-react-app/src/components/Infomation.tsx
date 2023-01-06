import styles from './Infomation.module.css';
import Cell from './Cell';
import { Side, Koma } from '../data/Constants';

interface IProps {
	tegomaSideA: Array<Koma>
	tegomaSideB: Array<Koma>
	isTegomaSelected: boolean
	selectedTegomaIndex: number
	onTegomaCellClicked: (index:number) => void
}

export default function Infomation(props: IProps) {

	const renderTegomas = (side:Side) => {
		let tegomas: Array<Koma>

		if(side == Side.A){
			tegomas=props.tegomaSideA
		}else{
			tegomas=props.tegomaSideB
		}

		if(tegomas.length === 0){
			return <>手駒がありません。</>;
		}

        const elements:Array<JSX.Element> = [];
		for(let i=0; i<tegomas.length ; i++){
			elements.push(<Cell
				key={i}
				selectable={side == Side.A}
				selected={side == Side.A && props.isTegomaSelected && props.selectedTegomaIndex===i}
				movable={false}
				cellData={{ side: side, koma: tegomas[i] }}
				cellIndex={{ x: -1, y: -1 }}
				// boardData={props.data.currentBoardData}
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
			<div className={styles.header}>turn={-1}</div>
		</div>
	);
}