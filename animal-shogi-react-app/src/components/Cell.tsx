import styles from './Cell.module.css';
import {ICellData, Koma, Side} from './GameView';


// export interface IActor {
// 	id: number
// 	name: string
// 	// skillIds?: number[]
// 	// skills: Skill[]
// }

interface IProps{
	cellData: ICellData
}

export default (props: IProps)=>{

    function testOnClick(){
        window.alert("123");
    }

    const komaChara = (): JSX.Element =>{
        switch(props.cellData.koma){
            case Koma.Hiyoko:
                return (<>🐥</>);
            case Koma.Kirin:
                return (<>🦒</>);
            case Koma.Lion:
                return (<>🦁</>);
            case Koma.Zou:
                return (<>🐘</>);
            case Koma.Niwatori:
                return (<>🐔</>);
            case Koma.NULL:
            default:
                return (<></>);                
        }
    }

    return (
        <div className={`
            ${styles.cell}
            ${props.cellData.side == Side.A ? styles.selectable : ""}
            ${props.cellData.side == Side.B ? styles.invert : ""}
            ${props.cellData.koma == Koma.NULL ? styles.empty : ""}
        `} onClick={testOnClick}>
            {komaChara()}
        </div>
	);
}