import { EvaluateState } from '../data/BoardEvaluateData'
import { Move, Put } from '../Utils';

/**
 * type AIResults
 * - AIの返却型
 */
export class AIResult{
	// 完了してない時の応答
	public withNext?: [current:number, total:number, count:number, Next:()=>AIResult]
	// 駒移動の応答
	public withMove?: Move
	// 手駒配置の応答
	public withPut?: Put
	// ゲームオーバーだった応答
	public withState?: EvaluateState
}