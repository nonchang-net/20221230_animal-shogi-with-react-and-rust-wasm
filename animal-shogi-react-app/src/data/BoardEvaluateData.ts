/**
 * BoardEvaluator
 * - BoardDataを渡すとUI/AI処理に必要なBoardEvaluateDataを返すEvaluate()関数を提供
 * - 表現に必要なデータクラスを定義
 */

import Utils, { Position } from "../Utils"
import { BoardData } from "./BoardData"
import { Koma, Side } from "./Constants"


// サイドごとの評価済み情報をまとめるクラス
export class SideEvaluationData {
	// 選択可能なコマ位置の一覧。移動不可能なコマは除く
	public selectablePos: Array<Position>
	// 着手可能手の一覧
	public enableMoves: Array<{from:Position, to:Position}>
	// 効いている場所の盤面マップ
	public attackablePositionMap: Array<Array<boolean>>
	// チェックメイトされているかどうか
	public isCheckmate: boolean

	constructor(){
		this.selectablePos = new Array<Position>()
		this.enableMoves = new Array<{from:Position, to:Position}>()
		this.attackablePositionMap = Utils.GetFilledFlagBoard(false)
		this.isCheckmate = false
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
			default: throw "undefined side "+side
		}
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


// 盤面状態を評価
// 以下の情報を収集する
// - Side.A/Bそれぞれの、着手可能手の一覧を収集
// - Side.A/Bそれぞれの、効いている場所一覧を収集
// - (UI用) プレイヤーの選択可能な駒の一覧を収集
export const Evaluate = (boardData:BoardData):BoardEvaluateData => {

	let evaluateData = new BoardEvaluateData()

	// 1st pass:
	// - 先に「効いている」場所の一覧フラグを更新する
	// - 次のトラバース段における手判定で、ライオンが効いている場所に移動できないよう判定するため
	// 全てのセル状態を評価していく
	boardData.Each((pos)=>{
		var cell=boardData.Get(pos)
		if(cell.side != Side.Free){
			const moveRules = Utils.GetKomaMoveRules(cell.koma)
			for(const rulePos of moveRules){
				// rulePosを適用した移動先セルを取得
				const targetPos = pos.Add(rulePos, cell.side)

				// 盤の範囲外は除外
				if(!targetPos.IsValidIndex()) continue;

				// メモ: 自分サイドの駒が存在するセルには置けないが、効いている
				// - なのでここでは、評価Side側の駒が動ける場所は全て無条件でtrueで良い
				evaluateData.Side(cell.side).attackablePositionMap[targetPos.y][targetPos.x] = true;
			}
		}
	})

	// 2nd pass: チェックメイトされているか格納する
	evaluateData.Side(Side.A).isCheckmate = IsCheckmate(Side.A, boardData, evaluateData.Side(Side.B).attackablePositionMap)
	evaluateData.Side(Side.B).isCheckmate = IsCheckmate(Side.B, boardData, evaluateData.Side(Side.A).attackablePositionMap)

	// 3rd path: チェックメイトされている方の局面は、ライオン周辺のみ評価する
	for(const side of [Side.A, Side.B]){
		if(evaluateData.Side(side).isCheckmate){
			// チェックメイトされている場合は、Lionが敵の効いてない場所にしか動けない
			const lionPos = boardData.Search(side, Koma.Lion)
			
			// 着手可能セル一覧は、もはやライオンしかない
			evaluateData.Side(side).selectablePos.push(lionPos)

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
				}
			}
		}
	}

	// 4th path: 全てのセル状態を評価
	// - チェックメイトされた方は評価済みなので初手でスルーする
	boardData.Each((pos)=>{
		const cell=boardData.Get(pos)
		const side = cell.side;
		if(side == Side.Free) return;

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

	return evaluateData;

}
