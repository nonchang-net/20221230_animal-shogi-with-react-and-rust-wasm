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
		result.withPut = {index:0, to:pos}
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
	move.promotion = (
		boardData.Get(move.from).koma === Koma.Hiyoko &&
		move.to.y === 3
	)

	// 移動の意思決定状態を返す
	const result = new AIResult()
	result.withMove = move
	return result
}
