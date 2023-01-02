import styles from './Board.module.css';


import {Side} from './GameView';
import Cell from './Cell';

interface IProps{
	data: Object
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
                    <div id='a1'><Cell /></div>
                    <div id='b1' className={styles.invert}><Cell /></div>
                    <div id='c1'><Cell /></div>
                <div>2</div>
                    <div id='a2'><Cell /></div>
                    <div id='b2'><Cell /></div>
                    <div id='c2'><Cell /></div>
                <div>3</div>
                    <div id='a3'><Cell /></div>
                    <div id='b3'><Cell /></div>
                    <div id='c3'><Cell /></div>
                <div>4</div>
                    <div id='a4'><Cell /></div>
                    <div id='b4'><Cell /></div>
                    <div id='c4'><Cell /></div>
            </div>
        </>

	);
}