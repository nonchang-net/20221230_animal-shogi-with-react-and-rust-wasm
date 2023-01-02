import styles from './Board.module.css';


import {Side, BoardData} from './GameView';
import Cell from './Cell';

interface IProps{
	data: BoardData
}


export default (props: IProps)=>{

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
                    <div id='b1'><Cell cellData={props.data[0][1]} /></div>
                    <div id='c1'><Cell cellData={props.data[0][2]} /></div>
                <div>2</div>
                    <div><Cell cellData={props.data[1][0]} /></div>
                    <div id='b1'><Cell cellData={props.data[1][1]} /></div>
                    <div id='c1'><Cell cellData={props.data[1][2]} /></div>
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