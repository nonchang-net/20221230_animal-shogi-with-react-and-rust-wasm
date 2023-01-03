/**
 * 盤情報管理クラス
// - 実データとしてのArray<Array<ICellData>>を継承して必要なメソッドを生やしたもの
//   - これ大丈夫？ ややこしくなりそうならデータは普通にメンバとして持たせる？
// - BoardDataは手駒を持たせたほうがいいのかな……？ GameDataに分割すると、BoardData内のメソッドで手駒を直接評価できないのが面倒くさそう。
 */
import {Side, Koma} from './Constants'
import {CellData} from './CellData'
import Utils, {Position} from '../Utils'

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

	// 仮置き: Koma enumを元にSide.A(下のプレイヤー)視点の移動可能方向セットを返す
	// - ルックアップテーブル書けば済むと思うのだけどインデックスシグネチャ周りで混乱したので一旦switch-caseで雑に定義。。
	// - もっといい書き方あると思うので後で直したい
	public GetKomaMoveRules(koma:Koma):Array<Position>{
		switch(koma){
			case Koma.Hiyoko:
				return [new Position(0,-1)]
			case Koma.Kirin:
				return [new Position(0,-1),new Position(-1,0),new Position(1,0),new Position(0,1)]
			case Koma.Lion: return [
					new Position(-1,-1),new Position(0,-1),new Position(1,-1),
					new Position(-1,0 ),                   new Position(1,0 ),
					new Position(-1,1 ),new Position(0,1 ),new Position(1,1 )
				]
			case Koma.Zou:return [
					new Position(-1,-1),  new Position(1,-1),
					new Position(-1,1 ),  new Position(1,1 )
				]
			case Koma.Niwatori: return [
				new Position(-1,-1),new Position(0,-1),new Position(1,-1),
				new Position(-1,0 ),                   new Position(1,0),
				                    new Position(0,1 ),
			]
			case Koma.NULL:
				return []
		}
	}

	// Positionを元にセル情報を取得
	// TODO: 最終的にこれ経由でしか取得できないようにして、Array extendsやめようかな
	public Get(pos:Position):CellData{
		// note: 配列リテラルで書いた時の表現とpositionの直感性がx,y逆なのでここで吸収している。。
		return this[pos.y][pos.x]
	}

	// 全てのセルにcallbackを適用する
	// - 座標渡し版
	private EachPosition(callback:(x:number,y:number)=>void){
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				callback(x,y)
			}
		}
	}
	// 全てのセルにcallbackを適用する
	// - セル情報だけで良い場合
	// private EachCell(callback:(cell:CellData)=>void){
	// 	for(var y=0 ; y<4 ; y++){
	// 		for(var x=0 ; x<3 ; x++){
	// 			var cell=this[y][x] ;
	// 			callback(cell)
	// 		}
	// 	}
	// }

	// フラグでフィルされた盤面評価用のboolean配列を作成
	private GetFilledFlagBoard(fill:boolean):Array<Array<boolean>>{
		return [[fill,fill,fill],[fill,fill,fill],[fill,fill,fill],[fill,fill,fill]];
	}

	// side側の盤上コマを全てコマ情報配列をタプル「[Koma,x,y]」として取得。
	// - getAttackableCells内のコードを、AIの探索で共有するため関数化。
	public GetOnboardKomas(side:Side):Array<[Koma,number,number]>{
		let results = new Array<[Koma,number,number]>();
		// for(var y=0 ; y<4 ; y++){
		// 	for(var x=0 ; x<3 ; x++){
		// 		var c=this[x][y] ;
		// 		if(c.side===side){
		// 			results.push([c.koma,x,y]);
		// 		}
		// 	}
		// }
		this.EachPosition((x,y)=>{
			var c=this[y][x] ;
			if(c.side===side){
				results.push([c.koma,x,y]);
			}
		})
		return results ;

	}

	// ランダムなセルを一つ取得
	// - 多分使わないテスト用
	// public TEST_GetRandomCell():CellData{
	// 	return this[Utils.randomRange(4)][Utils.randomRange(3)];
	// }

	// 座標にある駒が移動可能なセル先の一覧を検索し、booleanの二次元配列で返す
	private GetSettableCells(origin:Position):Array<Array<boolean>>{
		var enables=this.GetFilledFlagBoard(false); //falseで埋めた空のフラグテーブル
		// this.EachPosition((ty,tx)=>{
		// 	enables[y][x]=this.IsSettableCell(board,y,x,ty,tx);
		// })
		for(const movablePos of this.GetAllSettableCell(origin)){
			enables[movablePos.y][movablePos.y] = true;
		}
		return enables ;
	}

	// Positionにある駒が移動可能なPositionの配列を返す
	public GetAllSettableCell(pos:Position): Array<Position>{
		let results:Array<Position> = []
		// console.log("pos:",pos,this)
		var cell=this.Get(pos) ;
		// console.log("cell:",cell)
		const moveRules = this.GetKomaMoveRules(cell.koma)
		for(const rulePos of moveRules){
			// rulePosを適用した移動先セルを取得
			const targetPos = pos.Add(rulePos, cell.side)

			// 盤の範囲外
			if(!targetPos.IsValidIndex()){
				// console.log("範囲外走査", targetPos)
				continue;
			}

			const targetCell = this.Get(targetPos)
			// 自陣サイドの駒が存在するセルには置けない
			// console.log("targetCell:",cell, targetPos)
			if(targetCell.side === cell.side) continue;

			// ライオンは、取られる場所には移動できない
			if(cell.koma === Koma.Lion){
				console.error("IsCheckmate(): not implemented yet...")
				// TODO: IsCheckmate移植完了後に処理を見直す
				//if(komaType==Consts.LION && this.isCheckmate(nowBoard,cell.side,tx,ty)) return false ;
				// if(komaType==Koma.Lion){
				// 	//console.log("ライオンisCheckmateきました");
				// 	if(isCheckmate(board,cell.side,tx,ty)) return false ;
				// }
			}

			// 移動可能リストに追加
			results.push(targetPos)
		}
		return results;
	}

	// originセルのコマがtargetに移動できるかどうかを返す
	// TODO: これjQuery版で使われてたけど必要なんだろうか？
	// - 必要になるまでコメントアウト。実装はGetAllSettableCell()流用になったので必要なら復活させてもok
	// private IsSettableCell(origin:Position, target:Position): boolean{
	// 	for(const checkPos of this.GetAllSettableCell(origin)){
	// 		if(checkPos.x === target.x && checkPos.y === target.y) return true;
	// 	}
	// 	return false;
	// }

	// メモ: jQeury版コードのコピペ。必要か検討中
	// - side側の盤上コマを全てコマ情報配列をタプル「[Koma,x,y]」として取得。
	// - getAttackableCells内のコードを、AIの探索で共有するため関数化。
	// const getOnboardKomas=function(board:BoardData, side:Side){
	// 	let results = new Array<[Koma,number,number]>();
	// 	for(var y=0 ; y<4 ; y++){
	// 		for(var x=0 ; x<3 ; x++){
	// 			var c=board[x][y] ;
	// 			if(c.side===side){
	// 				results.push([c.koma,x,y]);
	// 			}
	// 		}
	// 	}
	// 	return results ;
	// }

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
