import styles from './Board.module.css';
import Cell from './Cell';

export default ()=>{
	return (
        <>
            <div className={styles.board}>
                <div>　</div>
                <div>ａ</div>
                <div>ｂ</div>
                <div>ｃ</div>
                
                
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