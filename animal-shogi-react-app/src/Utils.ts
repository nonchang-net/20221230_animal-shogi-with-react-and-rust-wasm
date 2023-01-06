/**
 * Utils.ts
 * - 共有メソッド置き場
 * - 状態に依存しないメソッドはクラスに定義せず、単独のユーティリティ関数に分けて分類していく方針
 */
import { Koma, Side } from "./data/Constants"

// 座標指定クラス
// - 差分をAddできるようにしたかっただけ。ただのベクトル
export class Position{
	x:number
	y:number
	constructor(x:number, y:number){
		this.x = x
		this.y = y
	}
	// サイドに応じてPositionを可変させる
	// - 要するに上から見たSide.Bの時はy座標のプラマイを逆にする
	public Add(pos:Position, side:Side = Side.A): Position{
		if(side === Side.A){
			return new Position(this.x + pos.x, this.y + pos.y)
		}else{
			return new Position(this.x + pos.x, this.y - pos.y)
		}
	}

	// positionが盤の範囲内かチェック
	// TODO: 責務ここじゃない気はする
	public IsValidIndex():boolean{
		if(this.x < 0 || this.y < 0) return false;
		if(this.x > 2 || this.y > 3) return false;
		return true
	}
	public EqualsTo(pos:Position):boolean{
		if(pos===undefined) return false;
		return (pos.x === this.x && pos.y === this.y)
	}
}


// 0〜(x-1)の間の整数をランダムで返す
const RandomRange = (max: number):number => {
	return Math.floor(Math.random()*max)
}


// 仮置き: Koma enumを元にSide.A(下のプレイヤー)視点の移動可能方向セットを返す
// - ルックアップテーブル書けば済むと思うのだけどインデックスシグネチャ周りで混乱したので一旦switch-caseで雑に定義。。
// - もっといい書き方あると思うので後で直したい
const GetKomaMoveRules = (koma:Koma):Array<Position> => {
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

// Side.A/Bを反転する
const ReverseSide = (side:Side):Side =>{
	switch(side){
		case Side.A: return Side.B;
		case Side.B: return Side.A;
		default: throw new Error("cannot reverse side from: "+side.toString())
	}
}

// フラグでフィルされた盤面評価用のboolean配列を作成
const GetFilledFlagBoard = (b:boolean):Array<Array<boolean>> => {
    return [[b,b,b],[b,b,b],[b,b,b],[b,b,b]];
}

// 公開メソッド一覧をexport default
const publics={
	// privates？ 検討中
	RandomRange: RandomRange,

	GetKomaMoveRules: GetKomaMoveRules,
	ReverseSide: ReverseSide,
	GetFilledFlagBoard: GetFilledFlagBoard,

	// テスト系
	// TEST_getRandomCell: TEST_getRandomCell,
}
export default publics


// メモ: 以下の書き方はeslint警告になるので注意
// export default {
//     randomRange: randomRange,
// }
//   ↓
// > Assign object to a variable before exporting as module default
// > import/no-anonymous-default-export
