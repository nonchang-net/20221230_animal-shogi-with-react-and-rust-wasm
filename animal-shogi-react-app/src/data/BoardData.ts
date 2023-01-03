/**
 * 盤情報管理クラス
// - 実データとしてのArray<Array<ICellData>>を継承して必要なメソッドを生やしたもの
//   - これ大丈夫？ ややこしくなりそうならデータは普通にメンバとして持たせる？
// - BoardDataは手駒を持たせたほうがいいのかな……？ GameDataに分割すると、BoardData内のメソッドで手駒を直接評価できないのが面倒くさそう。
 */
import {Side, Koma} from './Constants'
import {CellData} from './CellData'
import Utils, {Position} from '../Utils'
import { GameData } from './GameData'

export class BoardData extends Array<Array<CellData>>{

	private gameData:GameData;

	public Sides:any = {}
	public playerSelectablePositions: Array<Position> = []

    constructor(gameData:GameData){
        super()
		this.gameData = gameData;
        this.Initialize()
    }

    public Initialize(){
		this[0]=[
            {
                side: Side.B,
                koma: Koma.Kirin
            },
            {
                side: Side.B,
                koma: Koma.Lion
            },
            {
                side: Side.B,
                koma: Koma.Zou
            },
        ];
        this[1]=[
            {
                side: Side.Free,
                koma: Koma.NULL
            },
            {
                side: Side.B,
                koma: Koma.Hiyoko
            },
            {
                side: Side.Free,
                koma: Koma.NULL
            },
        ];
        this[2]=[
            {
                side: Side.Free,
                koma: Koma.NULL
            },
            {
                side: Side.A,
                koma: Koma.Hiyoko
            },
            {
                side: Side.Free,
                koma: Koma.NULL
            },
        ];
        this[3]=[
            {
                side: Side.A,
                koma: Koma.Zou
            },
            {
                side: Side.A,
                koma: Koma.Lion
            },
            {
                side: Side.A,
                koma: Koma.Kirin
            },
        ];
    }

	// 仮置き: Koma enumを元にSide.A(下のプレイヤー)視点の移動可能方向セットを返す
	// - ルックアップテーブル書けば済むと思うのだけどインデックスシグネチャ周りで混乱したので一旦switch-caseで雑に定義。。
	// - もっといい書き方あると思うので後で直したい
	public GetKomaMoveRules(koma:Koma):Array<Position>{
		switch(koma){
			case Koma.Hiyoko:
				return [new Position(0,-1)]
			case Koma.Kirin:
				return [new Position(0,-1),new Position(-1,0),new Position(1,0),new Position(0,1)]
			case Koma.Lion: return [
					new Position(-1,-1),new Position(0,-1),new Position(1,-1),
					new Position(-1,0 ),                   new Position(1,0 ),
					new Position(-1,1 ),new Position(0,1 ),new Position(1,1 )
				]
			case Koma.Zou:return [
					new Position(-1,-1),  new Position(1,-1),
					new Position(-1,1 ),  new Position(1,1 )
				]
			case Koma.Niwatori: return [
				new Position(-1,-1),new Position(0,-1),new Position(1,-1),
				new Position(-1,0 ),                   new Position(1,0),
				                    new Position(0,1 ),
			]
			case Koma.NULL:
				return []
		}
	}

	// Positionを元にセル情報を取得
	// TODO: 最終的にこれ経由でしか取得できないようにして、Array extendsやめようかな
	public Get(pos:Position):CellData{
		// note: 配列リテラルで書いた時の表現とpositionの直感性がx,y逆なのでここで吸収している。。
		return this[pos.y][pos.x]
	}

	// 全てのセルにcallbackを適用する
	// - 座標渡し版
	private EachPosition(callback:(pos:Position)=>void){
		for(var y=0 ; y<4 ; y++){
			for(var x=0 ; x<3 ; x++){
				callback(new Position(x,y))
			}
		}
	}

	// フラグでフィルされた盤面評価用のboolean配列を作成
	private GetFilledFlagBoard(b:boolean):Array<Array<boolean>>{
		return [[b,b,b],[b,b,b],[b,b,b],[b,b,b]];
	}


	// ランダムなセルを一つ取得
	// - 多分使わないテスト用
	// public TEST_GetRandomCell():CellData{
	// 	return this[Utils.randomRange(4)][Utils.randomRange(3)];
	// }


	// 盤面状態を評価
	// 以下の情報を収集する
	// - Side.A/Bそれぞれの、着手可能手の一覧を収集
	// - Side.A/Bそれぞれの、効いている場所一覧を収集
	// - (UI用) プレイヤーの選択可能な駒の一覧を収集
	// - 
	public Evaluate(){
		// TODO: インデックスシグネチャよくわからんので一旦anyな君(´・ω・｀)
		this.Sides[Side.A] = {
			enableMoves: new Array<[from:Position, to:Position]>,
			attackablePositionMap: this.GetFilledFlagBoard(false)
		}
		this.Sides[Side.B] = {
			enableMoves: new Array<[from:Position, to:Position]>,
			attackablePositionMap: this.GetFilledFlagBoard(false)
		}
		this.playerSelectablePositions = []

		// 1st pass:
		// - 先に「効いている」場所の一覧フラグを更新する
		// - 次のトラバース段における手判定で、ライオンが効いている場所に移動できないよう判定するため
		// 全てのセル状態を評価していく
		this.EachPosition((pos)=>{
			var cell=this.Get(pos)
			if(cell.side != Side.Free){
				const moveRules = this.GetKomaMoveRules(cell.koma)
				for(const rulePos of moveRules){
					// rulePosを適用した移動先セルを取得
					const targetPos = pos.Add(rulePos, cell.side)

					// 盤の範囲外は除外
					if(!targetPos.IsValidIndex()) continue;

					// メモ: 自分サイドの駒が存在するセルには置けないが、効いている
					// - なのでここでは、評価Side側の駒が動ける場所は全て無条件でtrueで良い
					this.Sides[cell.side].attackablePositionMap[targetPos.y][targetPos.x] = true;
				}
			}
		})

		// 2nd path: 全てのセル状態を評価していく
		this.EachPosition((pos)=>{
			var cell=this.Get(pos)
			if(cell.side != Side.Free){
				
				const moveRules = this.GetKomaMoveRules(cell.koma)
				for(const rulePos of moveRules){
					// rulePosを適用した移動先セルを取得
					const targetPos = pos.Add(rulePos, cell.side)

					// 盤の範囲外は除外
					if(!targetPos.IsValidIndex()) continue;

					const targetCell = this.Get(targetPos)
					// 自陣サイドの駒が存在するセルには移動できない
					if(targetCell.side === cell.side) continue;

					// ライオンは、取られる場所には移動できない
					if(cell.koma === Koma.Lion &&
						this.Sides[Utils.ReverseSide(cell.side)].attackablePositionMap[targetPos.y][targetPos.x]){
						continue;
					}

					// 以上の判定に引っ掛からなければ、この移動は着手可能手である
					// console.log("Sides[cell.side]",this.Sides[cell.side],cell.side.toString())
					this.Sides[cell.side].enableMoves.push({from:pos, to:targetPos})

					// Side.Aの場合、プレイヤーの着手可能セル一覧にも保存する
					if(cell.side === Side.A){
						this.playerSelectablePositions.push(pos)
					}
				}
			}
		})

		// console.log("Evaluate():",playerSelectablePositions,Sides)
	}

	
	// public GetEvaluatedPlayerEnableMoves()

}

