import styles from './Cell.module.css';

export default ()=>{

    function test(){
        window.alert("123");
    }

    return (
        <div className={styles.cell} onClick={test}>
        🐥
        {/* 🐥🦁🦒🐘 */}
        </div>
	);
}