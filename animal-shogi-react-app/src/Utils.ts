/**
 * Utils.ts
 * - 共有メソッド置き場
 * - 状態に依存しないメソッドはクラスに定義せず、単独のユーティリティ関数に分けて分類していく方針
 */
import { Koma, Side } from "./data/Constants"
import { BoardData } from "./data/BoardData"
import { CellData } from "./data/CellData"

// 0〜(x-1)の間の整数をランダムで返す
const randomRange = (max: number):number => {
    return Math.floor(Math.random()*max)
}

// boardからランダムなセルを一つ取得する
const TEST_getRandomCell = (boardData:BoardData):CellData=>{
    return boardData[randomRange(3)][randomRange(4)];
}


//side側の盤上コマを全てコマ情報配列をタプル「[Koma,x,y]」として取得。
//・getAttackableCells内のコードを、AIの探索で共有するため関数化。
const getOnboardKomas=function(board:BoardData, side:Side){
	let results = new Array<[Koma,number,number]>();
	for(var y=0 ; y<4 ; y++){
		for(var x=0 ; x<3 ; x++){
			var c=board[x][y] ;
			if(c.side===side){
				results.push([c.koma,x,y]);
			}
		}
	}
	return results ;
}

// 公開メソッド一覧をexport default
const publics={
    randomRange: randomRange,

    // test系
    TEST_getRandomCell: TEST_getRandomCell,
}
export default publics


// メモ: 以下の書き方はeslint警告になるので注意
// export default {
//     randomRange: randomRange,
// }
//   ↓
// > Assign object to a variable before exporting as module default
// > import/no-anonymous-default-export
