import styles from './Infomation.module.css';
import Cell from './Cell';
import { Side, Koma } from '../data/Constants';
import { GameData } from '../data/GameData';

interface IProps {
	data: GameData
}

export default function Infomation(props: IProps) {

	const renderTegomas = (side:Side) => {
		const tegomas = props.data.currentBoardData.GetSideTegomas(side);

		if(tegomas.length === 0){
			return <>手駒がありません。</>;
		}

        const elements:Array<JSX.Element> = [];
		for(let i=0; i<tegomas.length ; i++){
			elements.push(<Cell
				key={i}
				selectable={side == Side.A}
				selected={false}
				movable={false}
				cellData={{ side: side, koma: tegomas[i] }}
				cellIndex={{ x: -1, y: -1 }}
				boardData={props.data.currentBoardData}
				onClicked={() => { }} />)
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
			<div className={styles.header}>turn={props.data.GetCurrentTurnCount()}</div>
		</div>
	);
}