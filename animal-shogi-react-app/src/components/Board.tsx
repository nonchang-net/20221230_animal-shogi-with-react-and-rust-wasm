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

    const boardData = props.data.currentBoardData;

    const onCellClicked = (x:number, y:number)=>{
        console.log("onClicked() ",x,y, boardData[x][y])
    }

    const renderColumns =(rowIndex:number) => {
        const elements:Array<JSX.Element> = [];
        for(let y=0; y<4 ; y++){
            elements.push(<div>{y+1}</div>)
            for(let x=0; x<3 ; x++){
                elements.push(<Cell
                    cellData={boardData[y][x]}
                    onClicked={()=>{onCellClicked(y,x)}}
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