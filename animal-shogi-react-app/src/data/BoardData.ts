import { CellData } from "../components/Cell";
import Utils, { Position } from "../Utils";
import { Koma, Side } from "./Constants";

// 現在の盤情報
export class BoardData{
	private cells: Array<Array<CellData>>

	constructor(initialBoardData:Array<Array<CellData>>){
		// deep copy
		// - JSON経由で手抜き
		this.cells = JSON.parse(JSON.stringify(initialBoardData));
	}

	public Clone(){
		return new BoardData(this.cells)
	}

	// Positionを元にセル情報を取得
	// TODO: 最終的にこれ経由でしか取得できないようにして、Array extendsやめようかな
	public Get (pos:Position):CellData {

		if(!pos.IsValidIndex()){
			throw new Error(`Get(): not valid. `+pos.x+":"+pos.y)
		}

		// note: 配列リテラルで書いた時の表現とpositionの直感性がx,y逆なのでここで吸収している。。
		return this.cells[pos.y][pos.x]
	}

	public Set (pos:Position, data:CellData){
		if(!pos.IsValidIndex()){
			throw new Error(`Set(): not valid. `+pos.x+":"+pos.y)
		}
		this.cells[pos.y][pos.x] = data
	}

	// サイドと駒種別で検索し、最初に見つかった座標を返す
	// - evaluationData.IsCheckmate専用状態、ライオン検索用
	// - なので見つからなかった場合はthrow
	public Search(side:Side, koma:Koma):Position {
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				const pos = new Position(x,y);
				const cell = this.Get(pos)
				if(cell.side === side && cell.koma === koma) return pos;
			}
		}
		throw new Error(`Search(${koma}) not found...`)
	}

	// 見つかったnull座標を全て返す
	// - 一旦ランダムAIのランダム手駒配置用に実装
	public SearchAllNull():Array<Position> {
		let results = new Array<Position>
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				const pos = new Position(x,y);
				const cell = this.Get(pos)
				if(cell.koma === Koma.NULL) results.push(pos);
			}
		}
		return results;
	}

	// 全てのセルにcallbackを適用する
	public Each (callback:(pos:Position)=>void) {
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				callback(new Position(x,y))
			}
		}
	}

	// 両陣営の効いてる場所のフラグマップのタプルを作成して返す
	public GetAttackableMaps():[
		Array<Array<boolean>>,
		Array<Array<boolean>>
	]{
		var sideAMap = Utils.GetFilledFlagBoard(false)
		var sideBMap = Utils.GetFilledFlagBoard(false)
		this.Each((pos)=>{
			var cell=this.Get(pos)
			if(cell.side === Side.Free) return;
			const moveRules = Utils.GetKomaMoveRules(cell.koma)
			for(const rulePos of moveRules){
				// rulePosを適用した移動先セルを取得
				const targetPos = pos.Add(rulePos, cell.side)
	
				// 盤の範囲外は除外
				if(!targetPos.IsValidIndex()) continue;
	
				// メモ: 自分サイドの駒が存在するセルには置けないが、効いている
				// - なのでここでは、評価Side側の駒が動ける場所は全て無条件でtrueで良い
				if(cell.side === Side.A){
					sideAMap[targetPos.y][targetPos.x] = true;
				}else{
					sideBMap[targetPos.y][targetPos.x] = true;
				}
			}
		})
		return [sideAMap, sideBMap]
	}

}