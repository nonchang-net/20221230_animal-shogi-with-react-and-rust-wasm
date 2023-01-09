import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, Evaluate, EvaluateState } from '../data/BoardEvaluateData'
import { AttackablePosScore, CheckmateScore, EnableMoveScore, Koma, KomaScore, LionLineScore, Side, TegomaScore, TryableScore } from '../data/Constants'
import Utils, { Hands, Move, Moves, Position, Put, Puts, Tegomas } from '../Utils';
import { AIResult } from './AIResult';
import { NegaMax } from './NegaMax';


// 評価中のデータのセット
// - セットで引き回すデータが多いのでくくっておく
class TemporaryState {
    side:Side
    board:BoardData
    tegomaSideA:Tegomas
    tegomaSideB:Tegomas
    evaluated:BoardEvaluateData
    DebugInfo = ""
    
    constructor(
        side:Side,
        board:BoardData,
        tegomaSideA:Tegomas,
        tegomaSideB:Tegomas,
        evaluated:BoardEvaluateData
    ){
        this.side = side
        this.board = board// .Clone()
        this.tegomaSideA = tegomaSideA
        this.tegomaSideB = tegomaSideB
        this.evaluated = evaluated //Evaluate(board, tegomaSideA, tegomaSideB)
    }
    public Tegomas():Tegomas{
        return this.side === Side.A ? this.tegomaSideA : this.tegomaSideB
    }
    public EnemyTegomas():Tegomas{
        return this.side === Side.B ? this.tegomaSideA : this.tegomaSideB
    }
    public EnemySide():Side{
        return this.side === Side.A ? Side.B : Side.A
    }
    public EnableMoves():Moves{
        return this.evaluated.Side(this.side).enableMoves
    }
    private Evaluated(){
        return this.evaluated.Side(this.side)
    }

    // 着手可能手の一覧を取得する
    public GetHands():Hands{
        let moves:Moves = this.EnableMoves()
        let puts:Puts = []
    
        // チェックメイトもトライアブルもない時は手駒をnull cellに配置する手を選べる
        if(
            !this.Evaluated().isCheckmate &&
            !this.Evaluated().isEnemyTryable)
        {
            for(let tegomaIndex=0 ; tegomaIndex < this.Tegomas().length ; tegomaIndex ++){
                for(const pos of this.board.SearchAllNull()){
                    puts.push({index:tegomaIndex, to:pos})
                }
            }
        }
        return {moves,puts}
    }


    public AddDebugInfo = (log:string)=>{
        // DebugInfo += "\n"+log
    }

    /**
    * 評価関数: AI評価専用
    * - 過去の実装をそのまま持ってきたのでエビデンスは不明
    * - 5桁スコアは勝利確定として扱ってた様子？よくわからん。。
    */
    public Score():number{

        this.DebugInfo = "";

        const enemySide = Utils.ReverseSide(this.side);
        const myEvals = this.evaluated.Side(this.side);
        const enemyEvals = this.evaluated.Side(enemySide);
    
        // まず勝利状態になっている場合は全て99999を返す
        if(myEvals.state !== EvaluateState.Playable){
    
            this.AddDebugInfo(`score= ${-99999} : side${this.side} は負けている`)
    
            return -99999 //自分は負けている
        }else if(enemyEvals.state !== EvaluateState.Playable){
    
            this.AddDebugInfo(`score= ${99999} : side${this.side} は勝利している`)
    
            return 99999 // 勝利している
        }
    
        let score = 0;
    
        // 盤面にある手駒で点数評価
        this.board.Each(pos => {
            const cell = this.board.Get(pos);
            if(cell.side !== Side.Free){
                // 自陣なら加算、相手駒なら減算
                const isMyKoma = this.side === cell.side ? 1 : -1;
                score += KomaScore[cell.koma] * isMyKoma;
    
                this.AddDebugInfo(`score= ${score} : side${cell.side} 盤面駒 ${cell.koma} で ${KomaScore[cell.koma] * isMyKoma}`)
            }
        });
    
        // 手駒で点数評価
        for(const koma of this.tegomaSideA){
            const isMyKoma = this.side === Side.A ? 1 : -1;
            score += TegomaScore[koma] * isMyKoma;
    
            this.AddDebugInfo(`score= ${score} : side${Side.A} 手駒 ${koma} で ${TegomaScore[koma] * isMyKoma}`)
        }
        for(const koma of this.tegomaSideB){
            const isMyKoma = this.side === Side.B ? 1 : -1;
            score += TegomaScore[koma] * isMyKoma;
    
            this.AddDebugInfo(`score= ${score} : side${Side.B} 手駒 ${koma} で ${TegomaScore[koma] * isMyKoma}`)
        }
    
        for(const side of [Side.A, Side.B]){
            const isMySide = this.side === side ? 1 : -1;
            const sideEval = this.evaluated.Side(side)
    
            // 着手可能手の多さを点数に加える
            score += sideEval.enableMoves.length * EnableMoveScore * isMySide;
    
            this.AddDebugInfo(`score= ${score} : side${side} 着手可能数 ${sideEval.enableMoves.length} で ${sideEval.enableMoves.length * EnableMoveScore * isMySide}`)
    
            // 効いてる場所の数を点数に加える
            const attackableCount = Utils.GetFlagBoardTrueCount(sideEval.attackablePositionMap)
            score += attackableCount * AttackablePosScore * isMySide;
    
            this.AddDebugInfo(`score= ${score} : side${side} 効いてる場所の数 ${attackableCount} で ${attackableCount * AttackablePosScore * isMySide}`)
    
            // Lionのトライ可能性評価で1ラインごとに加算
            const lionPos = this.board.Search(side, Koma.Lion);
            if(side === Side.A){
                score += (4-1- lionPos.y) * LionLineScore * isMySide;
    
                this.AddDebugInfo(`score= ${score} : side${side} ライオン進捗で ${(4-1- lionPos.y) * LionLineScore * isMySide}`)
            }else{
                score += lionPos.y * LionLineScore * isMySide;
                this.AddDebugInfo(`score= ${score} : side${side} ライオン進捗で ${lionPos.y * LionLineScore * isMySide}`)
            }
    
            // チェックメイトしている場合は一定点数加算
            score += sideEval.isCheckmate ? CheckmateScore * isMySide : 0
            this.AddDebugInfo(`score= ${score} : side${side} チェックメイトボーナス ${sideEval.isCheckmate ? CheckmateScore * isMySide : 0}`)
            
    
            // トライ可能な時は一定点数加算。敵側フラグなので注意
            score += sideEval.isEnemyTryable ? TryableScore * -isMySide : 0
            this.AddDebugInfo(`score= ${score} : side${side} トライ可能ボーナス ${sideEval.isEnemyTryable ? TryableScore * -isMySide : 0}`)
        }
    
        return score;	
    }
    
    // moveを適用した状態のクローンを作成
    public GetMovedClone(move:Move):TemporaryState{
        // ボードをクローンして状態を適用・評価
        const newBoard = this.board.Clone()
        const moveCell = newBoard.Get(move.from)
        newBoard.Set(move.to, {koma:moveCell.koma,side:this.side})
        newBoard.Set(move.from, {koma:Koma.NULL,side:Side.Free})
        const newEvaluated = Evaluate(newBoard, this.tegomaSideA, this.tegomaSideB);
    
        // デバッグ
        // console.log(`move eval:`,move, moveCell, score)

        return new TemporaryState(
            this.EnemySide(),// negamax準備のため、手を打ったcloneのsideは反転させる
            newBoard,
            this.tegomaSideA,
            this.tegomaSideB,
            newEvaluated
        )
    }

    // moveを適用した状態のスコアを算出
    public GetMovedScore(move:Move):number{
        const cloned = this.GetMovedClone(move);
        return cloned.Score()
    }

    // putを適用した状態のクローンを作成
    public GetPuttedClone(put:Put):TemporaryState{

        const newBoard = this.board.Clone()
        const putTegoma = this.side === Side.A ? this.tegomaSideA[put.index] : this.tegomaSideB[put.index]
        // 手駒を配置
        newBoard.Set(put.to, {koma:putTegoma, side:this.side})

        // セットした手駒がない状態をclone
        const newTegomaSideB = new Array<Koma>()
        for(let i=0 ; i<this.tegomaSideB.length ; i++){
            if(i !== put.index) newTegomaSideB.push(this.tegomaSideB[i])
        }
        // 盤面評価実行
        const newEvaluated = Evaluate(newBoard, this.tegomaSideA, this.tegomaSideB);

        return new TemporaryState(
            this.EnemySide(),// negamax準備のため、手を打ったcloneのsideは反転させる
            newBoard,
            this.tegomaSideA,
            this.tegomaSideB,
            newEvaluated
        )
    }

    // putを適用した状態のスコアを取得
    public GetPuttedScore(put:Put):number{
        const cloned = this.GetPuttedClone(put);
        return cloned.Score();
    }

}



// 着手可能手を全評価するAI
export const DoNormalAI = (
	tegomaSideA:Tegomas,
	tegomaSideB:Tegomas,
	board:BoardData,
	evaluated:BoardEvaluateData
): AIResult => {
	// return GetHighscoreHand(Side.B, board, tegomaSideA, tegomaSideB, evaluated)
    const states = new TemporaryState(Side.B, board, tegomaSideA, tegomaSideB, evaluated)
    let evaluateCount = 0;
    let highScore = -999999;

    // 着手可能手の一覧を取得
    const hands:Hands = states.GetHands()

    // 選択した手を格納
    // note: 必ず最初の評価でハイスコアが更新されて上書きされるのだけど、初期値を入れないとコンパイルエラーになるので仕方なく無効な値で初期化している
    let selectedMove:Move = {from: new Position(-1,-1), to: new Position(-1, -1)}

    // 1st pass: 盤上の着手可能手から一番高いスコアの手を探す
    for(const move of hands.moves){
        const score = states.GetMovedScore(move)

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
        const score = states.GetPuttedScore(put)

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
		states.board.Get(selectedMove.from).koma === Koma.Hiyoko &&
		selectedMove.to.y === 3
	)
	result.withMove = selectedMove
    return result;
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
	tegomaSideA: Tegomas,
	tegomaSideB: Tegomas,
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