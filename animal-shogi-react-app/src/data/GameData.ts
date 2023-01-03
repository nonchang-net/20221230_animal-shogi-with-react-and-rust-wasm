import {Koma} from './Constants';
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
    private tegomas: Array<Array<Koma>>; // index 0=自分の手駒、1=相手の手駒
	private turn: number;

    constructor(){
        this.humanIsFirst = true; //とりあえず人間先行固定
		this.historiesData = new Array<IHistoryData>();
		this.tegomas = new Array<Array<Koma>>();
		this.turn = 0;

		// boardDataはこのクラス自体に依存しているので最後
        this.currentBoardData = new BoardData(this);

		// 最初の評価を実行しておく
		this.currentBoardData.Evaluate()
    }

	public IsHumanIsFirst():boolean{
		return this.humanIsFirst;
	}

}