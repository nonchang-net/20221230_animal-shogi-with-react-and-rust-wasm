import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, DebugInfo, Evaluate, EvaluateState, GetBoardScore } from '../data/BoardEvaluateData'
import { Koma, Side } from '../data/Constants'
import Utils, { Hands, Move, Moves, Position, Put, Puts, Tegomas } from '../Utils';
import { AIResult } from './AIResult';
import { NegaMax } from './NegaMax';


// 着手可能手の一覧を取得する
const GetHands = (
    side:Side,
    tegomas:Tegomas,
    board:BoardData,
    evaluated: BoardEvaluateData
):Hands =>{
    let moves:Moves = evaluated.Side(side).enableMoves
    let puts:Puts = []

    // チェックメイトもトライアブルもない時は手駒をnull cellに配置する手を選べる
    if(!evaluated.Side(Side.B).isCheckmate && !evaluated.Side(Side.B).isEnemyTryable)
    {
        for(let tegomaIndex=0 ; tegomaIndex < tegomas.length ; tegomaIndex ++){
            for(const pos of board.SearchAllNull()){
                puts.push({index:tegomaIndex, to:pos})
            }
        }
    }
    return {moves,puts}
}

export const DoNormalAI = (
	tegomaSideA:Tegomas,
	tegomaSideB:Tegomas,
	boardData:BoardData,
	evaluated:BoardEvaluateData
): AIResult => {

    let evaluateCount = 0;
    let highScore = -999999;

    // 選択した手を格納
    // note: 必ず最初の評価でハイスコアが更新されて上書きされるのだけど、初期値を入れないとコンパイルエラーになるので仕方なく無効な値で初期化している
    let selectedMove:Move = {from: new Position(-1,-1), to: new Position(-1, -1)}

    // let HighScoreDebugInfo = ""

    // コンピューターの着手可能手の一覧を取得
    const hands:Hands = GetHands(
        Side.B,
        tegomaSideB,
        boardData,
        evaluated
    )

    // 1st pass: 盤上の着手可能手から一番高いスコアの手を探す
    for(const move of hands.moves){
        // newBoard でコマを移動したデータを作る
        const newBoard = boardData.Clone()
        const moveCell = newBoard.Get(move.from)

        newBoard.Set(move.to, {koma:moveCell.koma,side:Side.B})
        newBoard.Set(move.from, {koma:Koma.NULL,side:Side.Free})

        // 盤面評価実行
        const newEvaluated = Evaluate(newBoard, tegomaSideA, tegomaSideB);
        // 点数算出
        const score = GetBoardScore(Side.B, newBoard, tegomaSideA, tegomaSideB, newEvaluated)

        // デバッグ
        // console.log(`move eval:`,move, moveCell, score)

        // ハイスコアを更新したら選択手とする
        if(score > highScore){
            highScore = score ;
            selectedMove = move
            // HighScoreDebugInfo = DebugInfo
        }
        evaluateCount ++;
    }

    // 2nd pass: チェックメイトもトライアブルもない時は手駒評価
    // - 全ての手駒を全ての空き枠に配置して、より高いスコアの局面があるかチェック

    let selectedPut: Put = {index:-1, to:new Position(-1,-1)}
    for(const put of hands.puts){
        const newBoard = boardData.Clone()
        const putTegoma = tegomaSideB[put.index]

        // 手駒を配置
        newBoard.Set(put.to, {koma:putTegoma, side:Side.B})

        // セットした手駒がない状態をclone
        const newTegomaSideB = new Array<Koma>()
        for(let i=0 ; i<tegomaSideB.length ; i++){
            if(i !== put.index) newTegomaSideB.push(tegomaSideB[i])
        }

        // 盤面評価実行
        const newEvaluated = Evaluate(newBoard, tegomaSideA, tegomaSideB);
        // 点数算出
        const score = GetBoardScore(Side.B, newBoard, tegomaSideA, tegomaSideB, newEvaluated)

        // デバッグ
        // console.log(`put eval:`,putTegoma, pos, score)

        // ハイスコアを更新したら選択手とする
        if(score > highScore){
            highScore = score ;
            selectedPut = put
            // HighScoreDebugInfo = DebugInfo
        }
        evaluateCount ++;
    }

    if(selectedPut.index != -1){
        // 持ち駒からの成績の方がよい場合は、持ち駒を配置する
		const result = new AIResult()
		result.withPut = selectedPut
		return result
    }

	// 移動の意思決定状態を返す
	const result = new AIResult()
    // ヒヨコでy=3を選んだ際は、コンピューターは常時promotionする
	selectedMove.promotion = (
		boardData.Get(selectedMove.from).koma === Koma.Hiyoko &&
		selectedMove.to.y === 3
	)
	result.withMove = selectedMove

    // console.log(HighScoreDebugInfo)

	return result
}



/**
 * negamaxで先読み
 * @param tegomaSideA 
 * @param tegomaSideB 
 * @param boardData 
 * @param evaluated 
 */
export const DoNormalAIWithNegaMax = (
    limitScore: number,
	tegomaSideA: Array<Koma>,
	tegomaSideB: Array<Koma>,
	board: BoardData,
	evaluated: BoardEvaluateData
): AIResult => {

    // 現在の評価回数
    let evaluateCount = 0;

    // withNext()で中断する評価回数
    const evaluatePauseCount = 100;

    // 現在の探索深さ
    let currentDepth = 0;

    // 最大探索深さ
    const maxDepth = 3;

	// 中断情報を返すコールバックサンプル
	const recursiveEvaluation = ():AIResult => {
		currentDepth ++;
		if(currentDepth >= maxDepth){
			// 最終的にここで結果が帰る
			// return NegaMax(tegomas, boardData, boardEvaluateData)

            // TODO仮置き
			const result = new AIResult()
			result.withState = EvaluateState.GameOverWithCheckmate
			return result
		}
		// 未完了ならコールバックを返す
		return continuasExecute()
	}

	// 未完了時応答
	const continuasExecute = ():AIResult =>{
		// 継続処理を呼び出し元に返す
		const result = new AIResult()
		result.withNext = [
			currentDepth, maxDepth, -1, ()=>{return recursiveEvaluation()}
		]
		return result;
	}

	// 初回処理開始
	return continuasExecute();
}