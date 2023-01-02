/**
 * GameView.tsx
 * - ゲーム状態管理ブロック
 * - 子コンポーネントへの表示指示出しをする
 */

import styles from './GameView.module.css';

// import Board, {InitialBoardData} from './Board';
import Board from './Board';
import Infomation from './Infomation';

// どちらサイドの駒かを判別するenum
export enum Side{
    Free = 0,
    A = -1,
    B = 1
}

// セルに置かれている駒種別を示すenum
export const enum Koma{
	NULL,
	Lion,
	Kirin,
	Zou,
	Hiyoko,
	Niwatori
}

export interface ICellData{
    side: Side;
    koma: Koma;
}

export type BoardData = Array<Array<ICellData>>;

// まずは手打ちで初期盤面情報を定義
const InitialBoardData: BoardData = [
    [
        {
            side: Side.B,
            koma: Koma.Kirin
        },
        {
            side: Side.B,
            koma: Koma.Lion
        },
        {
            side: Side.B,
            koma: Koma.Zou
        },
    ],
    [
        {
            side: Side.Free,
            koma: Koma.NULL
        },
        {
            side: Side.B,
            koma: Koma.Hiyoko
        },
        {
            side: Side.Free,
            koma: Koma.NULL
        },
    ],
    [
        {
            side: Side.Free,
            koma: Koma.NULL
        },
        {
            side: Side.A,
            koma: Koma.Hiyoko
        },
        {
            side: Side.Free,
            koma: Koma.NULL
        },
    ],
    [
        {
            side: Side.A,
            koma: Koma.Zou
        },
        {
            side: Side.A,
            koma: Koma.Lion
        },
        {
            side: Side.A,
            koma: Koma.Kirin
        },
    ],
];

// ヒストリ情報
// - targetは動かす元の座標x/y。
//   - 座標xに「4」が指定された際は、yで手駒インデックスを指定する
// - mobeToは動かす先の座標x/y
// - promotionは成るか否か
// あくまで操作それ自体の配列で表現し、ルールに沿った動作かどうかはデータとしては持たない。
interface IHistoryData{
    target: [number, number]
    moveTo: [number, number]
    promotion: boolean
}

// ヒストリ型: ただのIHisotyrDataの配列
type HistoriesData = Array<IHistoryData>;

interface IGameData{
    humanIsFirst: boolean // 先行か否か
    currentBoardData: BoardData
    historiesData: HistoriesData
    tegomas: Array<Array<Koma>> // index 0=自分の手駒、1=相手の手駒
}


// 以下はメモ: ルール実装クラスを作って移動するかも

// 	//方向のビット表現
// 	const MOVE_NONE = 0 ;
// 	const MOVE_UPPER = 1 ;
// 	const MOVE_UPPER_LEFT = 2 ;
// 	const MOVE_LEFT = 4 ;
// 	const MOVE_LOWER_LEFT = 8 ;
// 	const MOVE_LOWER = 16 ;
// 	const MOVE_LOWER_RIGHT = 32 ;
// 	const MOVE_RIGHT = 64 ;
// 	const MOVE_UPPER_RIGHT = 128 ;

//     // コマの移動可能方向の定義
//     const HIYOKO_MOVABLE=(MOVE_UPPER);
//     const KIRIN_MOVABLE=(MOVE_UPPER|MOVE_LEFT|MOVE_LOWER|MOVE_RIGHT);
//     const ZOU_MOVABLE=(MOVE_UPPER_LEFT|MOVE_LOWER_LEFT|MOVE_LOWER_RIGHT|MOVE_UPPER_RIGHT);
//     const LION_MOVABLE=KIRIN_MOVABLE | ZOU_MOVABLE ;
//     const NIWATORI_MOVABLE=KIRIN_MOVABLE | MOVE_UPPER_LEFT | MOVE_UPPER_RIGHT ;

//     // 駒タイプ番号を放り込めば参照できるように整形（上いらなくて、こっちだけでよくね？）
//     // 移植TODO: TypeScriptだとどう表現すると楽かな
//     // const movables={};
//     // function init(){
//     //     movables[NULL]=0 ;
//     //     movables[KIRIN]=KIRIN_MOVABLE ;
//     //     movables[ZOU]=ZOU_MOVABLE ;
//     //     movables[HIYOKO]=HIYOKO_MOVABLE ;
//     //     movables[LION]=LION_MOVABLE ;
//     //     movables[NIWATORI]=NIWATORI_MOVABLE ;
//     // }
// }



// UI

export default () => {

    let currentBoard = InitialBoardData;

    return (
        <div className={styles.GameView}>
            <div>
                {/* メインの将棋盤 */}
                <Board data={currentBoard}/>
                {/* <Board data={{data:123}}/> */}
            </div>
            <div>
                {/* 手駒、情報枠 */}
                <Infomation />
            </div>
        </div>
	);
}