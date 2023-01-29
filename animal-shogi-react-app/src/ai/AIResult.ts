import { EvaluateState } from '../data/BoardEvaluateData'
import { Move, Put } from '../Utils';

/**
 * type AIResults
 * - AIの返却型
 */
export class AIResult{
	// 駒移動の応答
	public withMove?: Move
	// 手駒配置の応答
	public withPut?: Put
	// ゲームオーバーだった応答
	public withState?: EvaluateState
}