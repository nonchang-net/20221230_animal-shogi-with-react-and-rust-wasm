/**
 * AI規定クラス
 * - AIはboardDataとコールバック二手を受け取って、評価して以下の情報を返す。
 *  - 1. NextCallback()と中断状態を返す
 *      - 計算途中で進捗状態を返す目的
 *      - 進捗状況を{current:number, total:number, count:number}で返す。
 *          - current: 現在の進捗状況
 *          - total: AIごとの完了目標工数
 *          - count: AIの局面評価累計数などの追加情報
 *  - 2. 完了状態を返す
 *      - 最終的にAIが選んだ手を返す。
 *      - 手は以下のどちらかの型。
 *          - 2.a: {from:Position, to:Position, promotion:boolean}
 *              - どのコマをどこに移動するのか、成るかどうかをpromotionで指定
 *          - 2.b: {index:number, to:Position}
 * 				- indexの手駒を番に配置する
 */


import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, EvaluateState } from '../data/BoardEvaluateData'
import { Koma, Side } from '../data/Constants'
import Utils, { Position } from '../Utils';

/**
 * type AIResults
 * - AIの返却型
 */
export class AIResults{
	// 完了してない時の応答
	public withNext?: (current:number, total:number, count:number) => AIResults
	// 駒移動の応答
	public withMove?: [Position, Position, boolean]
	// 手駒配置の応答
	public withPut?: [number, Position]
	// ゲームオーバーだった応答
	public withState?: EvaluateState
}


// ランダムに手を返すAI
export const DoRandomAI1 = (
	tegomas:Array<Koma>,
	boardData:BoardData,
	boardEvaluateData:BoardEvaluateData
): AIResults => {

	// console.log(`RandomAI1() called.`)

	// 相手側評価が中心なので、SideBのevalデータを先にショートカットしておく
	const evalB = boardEvaluateData.Side(Side.B)

	if(tegomas.length !== 0
		&& !evalB.isCheckmate
		&& !evalB.isEnemyTryable
	){
		// 手駒があれば積極的に使う
		// ※isCheckmate/isEnemyTryableの時は手駒を置いてる場合じゃないのでスルーする
		// let newBoardData = boardData.Clone()
		// let tegoma = tegomas.pop() as Koma
		const allPos = boardData.SearchAllNull()
		const pos = allPos[Utils.RandomRange(allPos.length)]
		// newBoardData.Set(pos, {koma:tegoma, side:Side.B})
		// NextTurn(newBoardData)

		const result = new AIResults()
		result.withPut = [0, pos]
		return result
	}

	const enableMoves = evalB.enableMoves;

	// ステイルメイト: 着手可能手がない？
	// - wikipediaによれば、どうぶつしょうぎでチェックメイトされていなくて動ける場所がないという状況は発生しない？
	// - 
	if(enableMoves.length === 0){
		console.error(`ステイルメイト: 最終的にはここには来ないはず？ 一旦ゲームオーバー扱いにします`)
		const result = new AIResults()
		result.withState = EvaluateState.GameOverWithCheckmate
		return result
	}

	// ランダムに着手可能手を盤面から選ぶ
	const move = enableMoves[Utils.RandomRange(enableMoves.length)]

	// ヒヨコでy=3を選んだ際は、コンピューターは常時promotionする
	const promotion = (
		boardData.Get(move.from).koma === Koma.Hiyoko &&
		move.to.y === 3
	)

	// 移動実行
	const result = new AIResults()
	result.withMove = [move.from, move.to, promotion]
	return result

}

// ランダム手を指すAIを、無駄に3回待たせて分割で返すAI


// export const DoRandomAI1With3Sequence = (
// 	tegomas:Array<Koma>,
// 	boardData:BoardData,
// 	boardEvaluateData:BoardEvaluateData
// ): AIResults => {

// 	//public withNext?: [number, number, number, ()=>AIResults]

// 	// const total = 10;
// 	// let progress = 1;
// 	// const next = ():AIResults => {
// 	// 	progress ++;
// 	// 	if(progress >= total){
// 	// 		return DoRandomAI1(tegomas, boardData, boardEvaluateData)
// 	// 	}
// 	// 	return next(progress, total, -1)
// 	// }

// 	// とりあえず次に呼べば結果が返ってくるやつを返す
// 	const result = new AIResults()
// 	result.withNext = () => {
// 		return DoRandomAI1With3Sequence(tegomas, boardData, boardEvaluateData)
// 	}
// 	return result
// }