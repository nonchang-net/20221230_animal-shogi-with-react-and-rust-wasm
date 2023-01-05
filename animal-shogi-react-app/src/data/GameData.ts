import {Koma, Side} from './Constants';
import {BoardData} from './BoardData';
import {IHistoryData, HistoriesData} from './HistoryData';

// export interface IGameData{
//     humanIsFirst: boolean // 先行か否か
//     currentBoardData: IBoardData
//     historiesData: HistoriesData
//     tegomas: Array<Array<Koma>> // index 0=自分の手駒、1=相手の手駒
// }

// export class GameData implements IGameData{
export class GameData{

    private humanIsFirst: boolean; // 先行か否か
    public currentBoardData: BoardData;
    private historiesData: HistoriesData;
    // private tegomas: Array<Array<Koma>>; // index 0=自分の手駒、1=相手の手駒
	private turn: number;
	private currentSide: Side;

    constructor(){
        this.humanIsFirst = true; // TODO: とりあえず人間先行固定で実装中
		this.historiesData = new Array<IHistoryData>();
		// this.tegomas = new Array<Array<Koma>>();
		this.turn = 0;
		this.currentSide = this.humanIsFirst ? Side.A : Side.B;
        this.currentBoardData = new BoardData();

		// 最初の評価を実行しておく
		this.currentBoardData.Evaluate()
    }

	public Next(){
		this.turn ++ ;
	}

	public IsHumanIsFirst():boolean{
		return this.humanIsFirst;
	}

	public GetCurrentTurnCount(){ return this.turn; }

}