import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, DebugInfo, Evaluate, EvaluateState, GetBoardScore } from '../data/BoardEvaluateData'
import { Koma, Side } from '../data/Constants'
import Utils, { Move, Position } from '../Utils';
import { AIResult } from './AIResult';

export const DoNormalAI = (
	tegomaSideA:Array<Koma>,
	tegomaSideB:Array<Koma>,
	boardData:BoardData,
	evaluated:BoardEvaluateData
): AIResult => {

    // impremented now
    // const result = new AIResult()
    // result.withState = EvaluateState.GameOverWithCheckmate
    // return result

    let evaluateCount = 0;

    // まず手始めに、着手可能手全部のスコアを集めて、その中で一番スコアが高い手を返すAIを作る
    let highScore = -999999;

    // 選択した手
    // note: 必ず最初の評価でハイスコアが更新されて上書きされるのだけど、初期値を入れないとコンパイルエラーになるので仕方なく無効な値で初期化している
    let selectedMove:Move = {from: new Position(-1,-1), to: new Position(-1, -1)}

    let HighScoreDebugInfo = ""

    for(const move of evaluated.Side(Side.B).enableMoves){
        // newBoard でコマを移動したデータを作る
        const newBoard = boardData.Clone()
        const moveCell = newBoard.Get(move.from)

        newBoard.Set(move.to, {koma:moveCell.koma,side:Side.B})
        newBoard.Set(move.from, {koma:Koma.NULL,side:Side.Free})

        // 盤面評価実行
        const newEvaluated = Evaluate(newBoard);
        // 点数算出
        const score = GetBoardScore(Side.B, newBoard, tegomaSideA, tegomaSideB, newEvaluated)

        // デバッグ
        console.log(`move eval:`,move, moveCell, score)

        // ハイスコアを更新したら選択手とする
        if(score > highScore){
            highScore = score ;
            selectedMove = move
            HighScoreDebugInfo = DebugInfo
        }
        evaluateCount ++;
    }

    // 2nd pass: チェックメイトもトライアブルもない時は、全ての手駒を全ての空き枠に配置して、より高いスコアの局面があるかチェックする
    let selectedPut: [number, Position] = [-1, new Position(-1,-1)]
    if(!evaluated.Side(Side.B).isCheckmate && !evaluated.Side(Side.B).isEnemyTryable){
        for(let tegomaIndex=0 ; tegomaIndex < tegomaSideB.length ; tegomaIndex ++){
            for(const pos of boardData.SearchAllNull()){
                const newBoard = boardData.Clone()
                const putTegoma = tegomaSideB[tegomaIndex]

                // 手駒を配置
                newBoard.Set(pos, {koma:putTegoma, side:Side.B})

                // セットした手駒がない状態をclone
                const newTegomaSideB = new Array<Koma>()
                for(let i=0 ; i<tegomaSideB.length ; i++){
                    if(i !== tegomaIndex) newTegomaSideB.push(tegomaSideB[i])
                }

                // 盤面評価実行
                const newEvaluated = Evaluate(newBoard);
                // 点数算出
                const score = GetBoardScore(Side.B, newBoard, tegomaSideA, tegomaSideB, newEvaluated)

                // デバッグ
                console.log(`put eval:`,putTegoma, pos, score)

                // ハイスコアを更新したら選択手とする
                if(score > highScore){
                    highScore = score ;
                    selectedPut = [tegomaIndex, pos]
                    HighScoreDebugInfo = DebugInfo
                }
                evaluateCount ++;

            }
        }
    }

    if(selectedPut[0]!==-1){
        // 持ち駒からの成績の方がよい場合は、持ち駒を配置する
		const result = new AIResult()
		result.withPut = selectedPut
		return result
    }

	// 移動の意思決定状態を返す
	const result = new AIResult()
    // ヒヨコでy=3を選んだ際は、コンピューターは常時promotionする
	const promotion = (
		boardData.Get(selectedMove.from).koma === Koma.Hiyoko &&
		selectedMove.to.y === 3
	)
	result.withMove = [selectedMove, promotion]

    console.log(HighScoreDebugInfo)

	return result
}

