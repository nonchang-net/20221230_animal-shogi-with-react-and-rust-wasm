/**
 * 盤情報管理クラス
// - 実データとしてのArray<Array<ICellData>>を継承して必要なメソッドを生やしたもの
//   - これ大丈夫？ ややこしくなりそうならデータは普通にメンバとして持たせる？
// - BoardDataは手駒を持たせたほうがいいのかな……？ GameDataに分割すると、BoardData内のメソッドで手駒を直接評価できないのが面倒くさそう。
 */
import {Side, Koma} from './Constants';
import {CellData} from './CellData';

export class BoardData extends Array<Array<CellData>>{

    constructor(){
        super()
        this.Initialize()
    }

    public Initialize(){
		this[0]=[
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
        ];
        this[1]=[
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
        ];
        this[2]=[
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
        ];
        this[3]=[
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
        ];
    }

    /**
     * 評価開始
     * - 
     */
    public Evaluate(){
    }
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
