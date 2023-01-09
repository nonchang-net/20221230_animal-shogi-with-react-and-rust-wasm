import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, EvaluateState } from '../data/BoardEvaluateData'
import { Koma, Side } from '../data/Constants'
import Utils from '../Utils';
import { AIResult } from './AIResult';


// ランダムに手を返すAI
// - UI用にチェックメイト回避、トライアブル回避手に絞り込んでいることもあり、何気にプレイアブル
export const DoRandomAI1 = (
	tegomas:Array<Koma>,
	boardData:BoardData,
	boardEvaluateData:BoardEvaluateData
): AIResult => {

	// console.log(`RandomAI1() called.`)

	// 相手側評価が中心なので、SideBのevalデータを先にショートカットしておく
	const evalB = boardEvaluateData.Side(Side.B)

	if(tegomas.length !== 0
		&& !evalB.isCheckmate
		&& !evalB.isEnemyTryable
	){
		// 手駒があれば積極的に使う
		// ※isCheckmate/isEnemyTryableの時は手駒を置いてる場合じゃないのでスルーする
		const allPos = boardData.SearchAllNull()
		const pos = allPos[Utils.RandomRange(allPos.length)]
		const result = new AIResult()
		result.withPut = [0, pos]
		return result
	}

	const enableMoves = evalB.enableMoves;

	// ステイルメイト: 着手可能手がない？
	// - wikipediaによれば、どうぶつしょうぎでチェックメイトされていなくて動ける場所がないという状況は発生しない？
	// - 
	if(enableMoves.length === 0){
		console.error(`ステイルメイト: 最終的にはここには来ないはず？ 一旦ゲームオーバー扱いにします`)
		const result = new AIResult()
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

	// 移動の意思決定状態を返す
	const result = new AIResult()
	result.withMove = [move, promotion]
	return result
}

// ランダム手を指すAIを、複数回の継続情報に分けて返すサンプル
export const DoRandomAI1WithMultipleSequence = (
	tegomas:Array<Koma>,
	boardData:BoardData,
	boardEvaluateData:BoardEvaluateData
): AIResult => {

	// クロージャで進捗情報を保持
	const total = 10;
	let progress = 1;

	// 中断情報を返すコールバックサンプル
	const recursiveEvaluation = ():AIResult => {
		progress ++;
		if(progress >= total){
			// 最終的にここで結果が帰る
			return DoRandomAI1(tegomas, boardData, boardEvaluateData)
		}
		// 未完了ならコールバックを返す
		return continuasExecute()
	}

	// 未完了時応答
	const continuasExecute = ():AIResult =>{
		// 継続処理を呼び出し元に返す
		const result = new AIResult()
		result.withNext = [
			progress, total, -1, ()=>{return recursiveEvaluation()}
		]
		return result;
	}

	// 初回処理
	return continuasExecute();

}