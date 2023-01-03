import styles from './Board.module.css';

// import {Side, Koma} from '../data/Constants';
import {IBoardData} from '../data/BoardData';
import Cell from './Cell';

interface IProps{
	data: IBoardData
}


export default function Board (props: IProps){

    // 一旦ログ出し
    // console.log(props.data);

	return (
        <>
            <div className={styles.board}>
                <div></div>
                <div>a</div>
                <div>b</div>
                <div>c</div>
                
                <div>1</div>
                    <Cell cellData={props.data[0][0]} />
                    <Cell cellData={props.data[0][1]} />
                    <Cell cellData={props.data[0][2]} />
                <div>2</div>
                    <Cell cellData={props.data[1][0]} />
                    <Cell cellData={props.data[1][1]} />
                    <Cell cellData={props.data[1][2]} />
                <div>3</div>
                    <Cell cellData={props.data[2][0]} />
                    <Cell cellData={props.data[2][1]} />
                    <Cell cellData={props.data[2][2]} />
                <div>4</div>
                    <Cell cellData={props.data[3][0]} />
                    <Cell cellData={props.data[3][1]} />
                    <Cell cellData={props.data[3][2]} />
            </div>
        </>

	);
}