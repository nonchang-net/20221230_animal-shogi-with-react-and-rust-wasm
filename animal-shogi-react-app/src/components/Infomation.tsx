import styles from './Infomation.module.css';
import Cell from './Cell';

export default ()=>{
	return (
        <div className={styles.infomation}>
          <div>相手の持ち駒</div>
            <div className={styles.motigoma}><Cell /></div>
          <div>あなたの持ち駒</div>
            <div className={styles.motigoma}><Cell /></div>
          <div className={styles.header}>testtest<br /> testtest2</div>
        </div>
	);
}