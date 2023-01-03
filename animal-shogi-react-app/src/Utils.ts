/**
 * Utils.ts
 * - 共有メソッド置き場
 * - 状態に依存しないメソッドはクラスに定義せず、単独のユーティリティ関数に分けて分類していく方針
 */
import { Koma, Side } from "./data/Constants"
import { BoardData } from "./data/BoardData"
import { CellData } from "./data/CellData"

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
}


// 0〜(x-1)の間の整数をランダムで返す
const randomRange = (max: number):number => {
	return Math.floor(Math.random()*max)
}

// 公開メソッド一覧をexport default
const publics={
	// privates？ 検討中
	randomRange: randomRange,

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
