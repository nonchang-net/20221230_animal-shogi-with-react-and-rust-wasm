/**
 * BoardEvaluator
 * - BoardDataを渡すとUI/AI処理に必要なBoardEvaluateDataを返すEvaluate()関数を提供
 * - 表現に必要なデータクラスを定義
 */
import { CellData } from "../components/Cell";
import Utils, { Position } from "../Utils"
import { BoardData } from "./BoardData"
import { Koma, Side } from "./Constants"

export enum EvaluateState {
	Playable, // ゲーム続行可能
	GameOverWithCheckmate, // 評価ターン側にチェックメイト回避手がない
	GameOverWithTryable, // 評価ターンの相手側のトライ回避手がない
}

// サイドごとの評価済み情報をまとめるクラス
export class SideEvaluationData {
	// 評価結果enum
	public state: EvaluateState
	// 選択可能なコマ位置の一覧 移動不可能なコマは除く
	public selectablePos: Array<Position>
	// 着手可能手の一覧
	public enableMoves: Array<{from:Position, to:Position}>
	// 効いている場所の盤面マップ
	public attackablePositionMap: Array<Array<boolean>>
	// チェックメイトされているかどうか
	public isCheckmate: boolean
	// 相手がトライ可能かどうか
	public isEnemyTryable: boolean

	constructor(){
		this.state = EvaluateState.Playable
		this.selectablePos = new Array<Position>()
		this.enableMoves = new Array<{from:Position, to:Position}>()
		this.attackablePositionMap = Utils.GetFilledFlagBoard(false)
		this.isCheckmate = false
		this.isEnemyTryable = false
	}

	// fromからtoに移動可能か検索
	// - UIでselectedPosのコマがtoに移動可能かのフラグを返す用途
	// undone: いちいち検索せんといかんのかなこれ。もっといいデータ構造ありそう
	public IsMovable(from:Position, to:Position):boolean{
		for(const moves of this.enableMoves){
			if(moves.from.EqualsTo(from) && moves.to.EqualsTo(to)) return true;
		}
		return false;
	}

	// posが選択可能なコマかどうかを検索して返す
	public IsSelectable(pos:Position){
		for(const selectable of this.selectablePos){
			if(selectable.EqualsTo(pos)) return true;
		}
		return false;
	}
}

// 盤面評価情報
export class BoardEvaluateData{
	// Side.A|Bそれぞれの盤面評価用情報を保存
	// undone: Side.A|Bをキーにした連想配列にできないものか？
	private SideAInfo: SideEvaluationData
	private SideBInfo: SideEvaluationData

	constructor(){
		this.SideAInfo = new SideEvaluationData()
		this.SideBInfo = new SideEvaluationData()
	}

	public Side(side:Side){
		switch(side){
			case Side.A: return this.SideAInfo;
			case Side.B: return this.SideBInfo;
		}
		throw new Error("undefined side "+side.toString())
	}

}


// sideがチェックメイトされているかどうか
const IsCheckmate = (
	side: Side,
	boardData:BoardData,
	enemyArrackablePositionMap: Array<Array<boolean>>
): boolean => {
	const lionPos = boardData.Search(side, Koma.Lion)
	// Lionの所在地がattackableならチェックメイト。

	// console.log(`IsCheckmate: side:${side} isCheckmate:${enemyArrackablePositionMap[lionPos.y][lionPos.x]}: lionPos:`, lionPos, `e_attackages:`, enemyArrackablePositionMap)
	return enemyArrackablePositionMap[lionPos.y][lionPos.x];
}

// トライ可能なmoveの一覧を取得
const GetTryablePositions = (
	// 評価するサイド
	side:Side,
	// 現在の盤面情報
	boardData:BoardData,
	// 相手側サイドの効いてる座標一覧
	enemyArrackablePositionMap: Array<Array<boolean>>
): Array<Position> => {
	// 案: lionをが最深列の一歩手前にいる際に、最深列の「効いていない」場所の一覧を出す

	let results = new Array<Position>()

	// lionトライ評価必要かどうか確認
	const tryableLine = side === Side.A ? 1 : 2;
	const lionPos = boardData.Search(side, Koma.Lion)
	if(lionPos.y !== tryableLine) return []

	// トライ成功となるy座標
	const tryLine = side === Side.A ? 0 : 3;

	// x座標がを確認、安全なら結果に追加
	for(let x=0 ; x<3 ; x++){
		if(!enemyArrackablePositionMap[tryLine][x]){
			results.push(new Position(x,tryLine))
		}
	}
	return results
}


// 盤面状態を評価
// 以下の情報を収集する
// - Side.A/Bそれぞれの、着手可能手の一覧を収集
// - Side.A/Bそれぞれの、効いている場所一覧を収集
// - (UI用) プレイヤーの選択可能な駒の一覧を収集
export const Evaluate = (boardData:BoardData):BoardEvaluateData => {

	let evaluateData = new BoardEvaluateData()

	// 1st pass: attackablePositionMap作成
	// - 両陣営の「効いている」場所の一覧フラグマップを作成する
	const maps = boardData.GetAttackableMaps();
	evaluateData.Side(Side.A).attackablePositionMap = maps[0]
	evaluateData.Side(Side.B).attackablePositionMap = maps[1]

	// 2nd pass: チェックメイトされているか判定、格納
	// - 1st passの効いてる場所一覧情報を利用
	// undone: 手番じゃない方を評価する意味はないはず
	evaluateData.Side(Side.A).isCheckmate = IsCheckmate(Side.A, boardData, evaluateData.Side(Side.B).attackablePositionMap)
	evaluateData.Side(Side.B).isCheckmate = IsCheckmate(Side.B, boardData, evaluateData.Side(Side.A).attackablePositionMap)

	// 3rd path: チェックメイトされている方の着手可能手を評価
	// - ライオン周辺のみ評価する
	// undone: 手番じゃない方を評価する意味はないはず
	for(const side of [Side.A, Side.B]){
		if(evaluateData.Side(side).isCheckmate){
			
			// まずライオンの移動可能場所をenableMovesに入れていく
			const lionPos = boardData.Search(side, Koma.Lion)
			const moveRules = Utils.GetKomaMoveRules(Koma.Lion)
			for(const rulePos of moveRules){
	
				// rulePosを適用した移動先セルを取得
				const targetPos = lionPos.Add(rulePos, side)
	
				// 盤の範囲外は除外
				if(!targetPos.IsValidIndex()) continue;
				
				const targetCell = boardData.Get(targetPos)
				// 自陣サイドの駒が存在するセルには移動できない
				if(targetCell.side === side) continue;
	
				// 「ライオンが取られない場所」だけを格納する
				if(! evaluateData.Side(Utils.ReverseSide(side)).attackablePositionMap[targetPos.y][targetPos.x]
				){
					// この移動は着手可能手である
					evaluateData.Side(side).enableMoves.push({from:lionPos, to:targetPos})
					// 着手可能セル一覧にも保存する
					evaluateData.Side(side).selectablePos.push(lionPos)
				}
			}

			// チェックメイト回避手を探索
			// - 1. 自分のライオン以外のenableMovesを検査して、
			// - 2. to先に相手のコマがある場合に、
			//	 - 2-2. そのコマがなくなった時の相手のattackableMapを再評価して、
			//	 - 2-3. 自陣のライオンが安全になるなら、
			//	 - 2-4. そのmoveをenableMovesに追加する
			
			// 自分のライオン以外を精査
			const allSides = boardData.GetSideAll(side)
			for(const [cell,pos] of allSides){
				// ライオンはスキップ
				if(cell.koma === Koma.Lion) continue;
				// enableMovesを検査
				const moveRules = Utils.GetKomaMoveRules(cell.koma)
				for(const rulePos of moveRules){
		
					// rulePosを適用した移動先セルを取得
					const targetPos = pos.Add(rulePos, side)
		
					// 盤の範囲外は除外
					if(!targetPos.IsValidIndex()) continue;
					
					// ルール移動可能先のセル取得
					const targetCell = boardData.Get(targetPos)

					// 相手サイド
					const enemySide = Utils.ReverseSide(side)

					// ルール移動先が相手のコマでなければスルー
					if(targetCell.side !== enemySide) continue;

					// targetCellがいなくなった際の相手のattackableMapを取得
					const newBoard = boardData.Clone()
					newBoard.Set(targetPos, {koma:Koma.NULL,side:Side.Free})
					const maps = newBoard.GetAttackableMaps()
					const map = side === Side.A ? maps[1] : maps[0]

					// 自陣のライオンが安全になったなら、このmoveはチェックメイト回避手として有効
					const isLionSafe = !map[lionPos.y][lionPos.x]
					console.log(`isLionSafe: ${cell.koma} moves. ${pos.x}:${pos.y} to ${targetPos.x}:${targetPos.y} → safe? ${isLionSafe} : ${lionPos.x}:${lionPos.y} `, map)
					if(isLionSafe){
						//enableMovesに追加
						evaluateData.Side(side).enableMoves.push({from:pos, to:targetPos})
						// 着手可能セル一覧にも保存する
						evaluateData.Side(side).selectablePos.push(pos)
					}
				}
			}

			// 着手可能手がない場合、チェックメイト回避策がないのでGameOver
			// undone: 評価サイドのGameOverが決まったら後続の判定は不要
			if(evaluateData.Side(side).enableMoves.length === 0){
				evaluateData.Side(side).state = EvaluateState.GameOverWithCheckmate
			}
		}
	}

	// 4th path: 全てのセル状態を評価して着手可能手の一覧を作成
	// undone: 手番じゃない方を評価する意味はないはず
	boardData.Each((pos)=>{
		const cell=boardData.Get(pos)
		const side = cell.side;
		if(side === Side.Free) return;

		// チェックメイトされている方はlionで評価済みなので棄却
		if(evaluateData.Side(side).isCheckmate) return;

		const moveRules = Utils.GetKomaMoveRules(cell.koma)
		for(const rulePos of moveRules){
			// rulePosを適用した移動先セルを取得
			const targetPos = pos.Add(rulePos, side)

			// 盤の範囲外は除外
			if(!targetPos.IsValidIndex()) continue;

			const targetCell = boardData.Get(targetPos)
			// 自陣サイドの駒が存在するセルには移動できない
			if(targetCell.side === side) continue;

			// ライオンは、取られる場所には移動できない
			if(cell.koma === Koma.Lion &&
				evaluateData.Side(Utils.ReverseSide(side)).attackablePositionMap[targetPos.y][targetPos.x]
			){
				continue;
			}

			// 以上の判定に引っ掛からなければ、この移動は着手可能手である
			evaluateData.Side(side).enableMoves.push({from:pos, to:targetPos})

			// 着手可能セル一覧にも保存する
			evaluateData.Side(side).selectablePos.push(pos)
		}
	})

	// 5th pass: トライアブルチェック
	for(const side of [Side.A, Side.B]){
		// 相手のトライアブル状況を確認
		const enemySide = Utils.ReverseSide(side);
		const myAttacableMap = evaluateData.Side(side).attackablePositionMap
		const tryablePositions = GetTryablePositions(enemySide, boardData, myAttacableMap)

		// 相手が2箇所以上トライアブルならトライは防げない
		if(tryablePositions.length >= 2){
			evaluateData.Side(side).state = EvaluateState.GameOverWithTryable
		}

		// 相手が1箇所だけトライアブルなら、そこに対する着手可能手以外は許可できない
		if(tryablePositions.length === 1){
			const oldEnableMoves = new Array<{from:Position, to:Position}>()
			// clone
			for(const move of evaluateData.Side(side).enableMoves){
				oldEnableMoves.push(move)
			}
			// enableMoves取り上げ
			evaluateData.Side(side).enableMoves = []
			evaluateData.Side(side).selectablePos = []

			for(const move of oldEnableMoves){
				if(move.to.EqualsTo(tryablePositions[0])){
					// 見つかったので移動可能
					evaluateData.Side(side).enableMoves.push(move)
					evaluateData.Side(side).selectablePos.push(move.to)
				}
			}

			// 見つからなかったらトライは防げない
			if(evaluateData.Side(side).enableMoves.length === 0){
				evaluateData.Side(side).state = EvaluateState.GameOverWithTryable
			}
		}
	}


	return evaluateData;

}
