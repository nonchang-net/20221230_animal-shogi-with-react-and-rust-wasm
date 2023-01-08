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
	public withNext?: [current:number, total:number, count:number, Next:()=>AIResults]
	// 駒移動の応答
	public withMove?: [Position, Position, boolean]
	// 手駒配置の応答
	public withPut?: [number, Position]
	// ゲームオーバーだった応答
	public withState?: EvaluateState
}


// ランダムに手を返すAI
// - UI用にチェックメイト回避、トライアブル回避手に絞り込んでいることもあり、何気にプレイアブル
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

// ランダム手を指すAIを、複数回の継続情報に分けて返すサンプル
export const DoRandomAI1WithMultipleSequence = (
	tegomas:Array<Koma>,
	boardData:BoardData,
	boardEvaluateData:BoardEvaluateData
): AIResults => {

	// クロージャで進捗情報を保持
	const total = 10;
	let progress = 1;

	// 中断情報を返すコールバックサンプル
	const recursiveEvaluation = ():AIResults => {
		progress ++;
		if(progress >= total){
			// 最終的にここで結果が帰る
			return DoRandomAI1(tegomas, boardData, boardEvaluateData)
		}
		// 未完了ならコールバックを返す
		return continuasExecute()
	}

	// 未完了時応答
	const continuasExecute = ():AIResults =>{
		// 継続処理を呼び出し元に返す
		const result = new AIResults()
		result.withNext = [
			progress, total, -1, ()=>{return recursiveEvaluation()}
		]
		return result;
	}

	// 初回処理
	return continuasExecute();

}