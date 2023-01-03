import Utils, { Position } from '../Utils';

import styles from './Board.module.css';

// import {Side, Koma} from '../data/Constants';
// import {IBoardData} from '../data/BoardData';
import {GameData} from '../data/GameData';
import Cell from './Cell';

interface IProps{
	data: GameData
}

export default function Board (props: IProps){

    // 一旦ログ出し
    // console.log(props.data);

    const board = props.data.currentBoardData;

    const onCellClicked = (pos:Position)=>{
        console.log("onClicked() ",pos.x, pos.y, board.Get(pos))
        // ちょっと間借りテストなど
        // console.log("TEST_getRandomCell():", Utils.TEST_getRandomCell(boardData))
        // console.log("board.TEST_GetRandomCell", board.TEST_GetRandomCell())
        console.log("board.GetAllSettableCell()", board.GetAllSettableCell(pos))
    }

    const renderColumns =(rowIndex:number) => {
        const elements:Array<JSX.Element> = [];
        for(let y=0; y<4 ; y++){
            elements.push(<div>{y+1}</div>)
            for(let x=0; x<3 ; x++){
                elements.push(<Cell
                    cellData={board[y][x]}
                    onClicked={()=>{onCellClicked(new Position(x,y))}}
                />);
            }
        }
        return elements
    }

	return (
        <>
            <div className={styles.board}>
                <div></div>
                <div>a</div>
                <div>b</div>
                <div>c</div>
                {renderColumns(0)}
            </div>
        </>

	);
}