import {useState} from 'react'
import Utils, { Position } from '../Utils'

import styles from './Board.module.css'

// import {Side, Koma} from '../data/Constants'
// import {IBoardData} from '../data/BoardData'
import {GameData} from '../data/GameData'
import Cell from './Cell'
import { Koma, Side } from '../data/Constants'

interface IProps{
	data: GameData
}

export default function Board (props: IProps){

    // 一旦ログ出し
    // console.log(props.data);

    const board = props.data.currentBoardData;

    // セル選択状態state
    const [isSelected, setSelected] = useState(false);
    const [selectedPos, setSelectedPos] = useState(new Position(-1,-1));

    const onCellClicked = (pos:Position)=>{
        // console.log("onClicked() ",pos.x, pos.y, board.Get(pos))
        // console.log("onClicked() enableMoves? ", board.Sides[Side.A].enableMoves)
        // console.log("board.playerSelectablePositions:", board.playerSelectablePositions)
        
        // console.log("onClicked() isSelected", isSelected, selectedPos)
        // console.log("onClicked() GetMovablesByPos()", board.GetMovablesByPos(pos))
        
        if(isSelected){
            if(pos.EqualsTo(selectedPos)){
                // 選択状態から同じセルをクリック → 選択解除
                setSelectedPos(new Position(-1,-1));
                setSelected(false);
            }else if(board.IsMovablePos(board.GetMovablesByPos(selectedPos), pos)){
                // 選択状態から移動可能セルをクリックした → 移動実行

                // 成るか否か判定
                let promotion = false;
                if(pos.y === 0 && board.Get(selectedPos).koma === Koma.Hiyoko){
                    promotion = window.confirm("成りますか？")
                }

                // 移動実行
                board.Move(selectedPos, pos, promotion);

                // 選択解除 - ここでboard状態も反映される
                setSelectedPos(new Position(-1,-1));
                setSelected(false);

                // TODO: ターン変更
                props.data.Next()
            }
        }else{
            if(board.IsSelectable(pos)){
                // 何も選択されていない時に選択可能なセルをクリックした → 選択実行
                setSelectedPos(pos);
                setSelected(true);
            }
        }
    }

    const renderColumns =(rowIndex:number) => {
        const elements:Array<JSX.Element> = [];
        const selectedCellMovables = board.GetMovablesByPos(selectedPos)
        // console.log("selectedCellMovables",selectedCellMovables)
        for(let y=0; y<4 ; y++){
            elements.push(<div>{y+1}</div>)
            for(let x=0; x<3 ; x++){
                // console.log("renderColumns(): ",
                //     x,y,isSelected,selectedPos,
                //     new Position(x,y).EqualsTo(selectedPos),
                //     board.IsMovablePos(selectedCellMovables,selectedPos)
                // )
                const pos = new Position(x,y)
                elements.push(<Cell
                    key={"boardcells_"+x+"_"+y}
                    selectable={(!isSelected && board.IsSelectable(pos))}
                    selected={(isSelected && pos.EqualsTo(selectedPos))}
                    movable={(isSelected && board.IsMovablePos(selectedCellMovables, pos))}
                    cellData={board[y][x]}
                    cellIndex={{x:x, y:y}}
                    boardData={board}
                    onClicked={()=>{onCellClicked(pos)}}
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