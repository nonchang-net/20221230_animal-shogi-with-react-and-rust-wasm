import {useState} from 'react'
import Utils, { Position } from '../Utils'

import styles from './Board.module.css'

import {BoardData} from '../data/BoardData'
import Cell from './Cell'
import { BoardEvaluateData } from '../data/BoardEvaluateData'
import { Side } from '../data/Constants'

interface IProps{
    isBoardSelected: boolean
    setBoardSelected: (flag:boolean) => void
    selectedBoardPos: Position
    setSelectedBoardPos: (pos:Position) => void
    boardData: BoardData
    boardEvaluateData: BoardEvaluateData
    onCellClicked: (pos:Position) => void
}


export default function Board (props: IProps){

    const renderColumns =(rowIndex:number) => {
        const elements:Array<JSX.Element> = [];
        // const selectedCellMovables = GetMovablesByPos(selectedPos)
        // console.log("selectedCellMovables",selectedCellMovables)
        for(let y=0; y<4 ; y++){
            elements.push(<div>{y+1}</div>)
            for(let x=0; x<3 ; x++){
                // console.log("renderColumns(): ",
                //     x,y,isSelected,selectedPos,
                //     new Position(x,y).EqualsTo(selectedPos),
                //     IsMovablePos(selectedCellMovables,selectedPos)
                // )
                const pos = new Position(x,y)
                const evaluateData = props.boardEvaluateData.Side(Side.A)
                elements.push(<Cell
                    key={"boardcells_"+x+"_"+y}
                    selectable={(!props.isBoardSelected && evaluateData.IsSelectable(pos))}
                    selected={(props.isBoardSelected && pos.EqualsTo(props.selectedBoardPos))}
                    movable={(props.isBoardSelected && evaluateData.IsMovable(props.selectedBoardPos, pos))}
                    cellData={props.boardData.Get(new Position(x,y))}
                    cellIndex={{x:x, y:y}}
                    onClicked={()=>{props.onCellClicked(pos)}}
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