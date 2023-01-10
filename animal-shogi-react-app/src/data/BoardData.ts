import { CellData } from "../components/Cell";
import Utils, { BoolMap, Position, Positions } from "../Utils";
import { Koma, Side } from "./Constants";

// 現在の盤情報
export class BoardData{
	private cells: Array<Array<CellData>>

	constructor(initialBoardData:Array<Array<CellData>>){
		// deep copy
		// - JSON経由で手抜き
		// this.cells = JSON.parse(JSON.stringify(initialBoardData));
		this.cells = []
		for(var y=0 ; y<4 ; y++){
			this.cells[y] = []
			for(var x=0 ; x<3 ; x++){
				this.cells[y][x] = initialBoardData[y][x]
			}
		}
	}

	public Clone(){
		return new BoardData(this.cells)
	}

	// Positionを元にセル情報を取得
	public Get (pos:Position):CellData {

		// if(!pos.IsValidIndex()){
		// 	throw new Error(`Get(): not valid. `+pos.x+":"+pos.y)
		// }

		// note: 配列リテラルで書いた時の表現とpositionの直感性がx,y逆なのでここで吸収している。。
		return this.cells[pos.y][pos.x]
	}

	public Set (pos:Position, data:CellData){
		// if(!pos.IsValidIndex()){
		// 	throw new Error(`Set(): not valid. `+pos.x+":"+pos.y)
		// }
		this.cells[pos.y][pos.x] = data
	}

	// 全てのセルにcallbackを適用する
	public Each (callback:(pos:Position)=>void) {
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				callback(new Position(x,y))
			}
		}
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
	public SearchAllNull():Positions {
		let results = new Array<Position>()
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				const pos = new Position(x,y);
				const cell = this.Get(pos)
				if(cell.koma === Koma.NULL) results.push(pos);
			}
		}
		return results;
	}

	// 両陣営の効いてる場所のフラグマップのタプルを作成して返す
	public GetAttackableMaps():[BoolMap, BoolMap]{
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
	
				if(cell.side === Side.A){
					sideAMap[targetPos.y][targetPos.x] = true;
				}else if(cell.side === Side.B){
					sideBMap[targetPos.y][targetPos.x] = true;
				}else{
					throw new Error(`undefined index. ${cell.side}`)
				}
			}
		})
		return [sideAMap, sideBMap]
	}

	// sideのセル情報と位置情報を全部取得
	// - チェックメイト回避手探索で利用
	public GetSideAll(side:Side): Array<[cell:CellData,pos:Position]>{
		let results = new Array<[CellData,Position]>();
		this.Each((pos)=>{
			var cell=this.Get(pos);
			if(cell.side === side) results.push([cell,pos])
		});
		return results;
	}

}