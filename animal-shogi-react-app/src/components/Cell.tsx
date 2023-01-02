import styles from './Cell.module.css';



// export interface IActor {
// 	id: number
// 	name: string
// 	// skillIds?: number[]
// 	// skills: Skill[]
// }

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