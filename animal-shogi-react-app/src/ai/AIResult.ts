import { BoardData } from '../data/BoardData';
import { BoardEvaluateData, EvaluateState } from '../data/BoardEvaluateData'
import { Koma, Side } from '../data/Constants'
import Utils, { Position } from '../Utils';

/**
 * type AIResults
 * - AIの返却型
 */
export class AIResult{
	// 完了してない時の応答
	public withNext?: [current:number, total:number, count:number, Next:()=>AIResult]
	// 駒移動の応答
	public withMove?: [Position, Position, boolean]
	// 手駒配置の応答
	public withPut?: [number, Position]
	// ゲームオーバーだった応答
	public withState?: EvaluateState
}