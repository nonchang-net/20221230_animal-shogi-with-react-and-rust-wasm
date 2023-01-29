import React, { useEffect, useState } from 'react';
import styles from './css/App.module.css';

import Board from './components/Board';
import Infomation from './components/Captures';

import { AIType, Debug_InitialBoardData_FastFinish, InitialBoardData, Koma, Side } from './data/Constants';
import Utils, { Move, Position, Put } from './Utils';
import { Evaluate, EvaluateState } from './data/BoardEvaluateData';
import { BoardData } from './data/BoardData';
import { AIResult} from './ai/AIResult';
import { DoRandomAI1 } from './ai/RandomAI';
import { DoNormalAI, DoNormalAIWithNegaMax, TemporaryState } from './ai/NormalAI';


// wasmテスト

const wasm = './animal_shogi_rust_app.wasm'
let wasm_is_loaded = false;
let get_next_hand_by_wasm:any = undefined; // TODO: これanyにするしかないのかな……？
fetch(wasm)
	.then(response => response.arrayBuffer())
	.then(bytes => WebAssembly.instantiate(bytes))
	.then(results => {
		console.log("ver 20230128 17:13");

		// tests:
		// const ex:any = results.instance.exports;
		// const wasm_result = ex.add(-3, 2);
		// console.log("wasm output:", wasm_result);

		// wasm呼び出し: negamax結果取得テスト
		const ex:any = results.instance.exports;
		get_next_hand_by_wasm = ex.get_next_hand;
		const wasm_result = get_next_hand_by_wasm(
			0, //side
			 1, 2, 3, // board状態
			 4, 5, 0,
			-1,-2,-3,
			-4,-5, 0,
			1,1,1,0,0,0 // 手駒状態
		);
		// console.log("wasm output:", wasm_result);

		// 返り値のNumver(f64)を4bitごとに区切って取り出す
		// - 配列で受け取る方法が手間そうなので端折った
		const ret1 = wasm_result & 0xF;
		const ret2 = (wasm_result >> 4) & 0xF;
		const ret3 = (wasm_result >> 8) & 0xF;
		const ret4 = (wasm_result >> 12) & 0xF;

		console.log("wasm output splitted:", ret1, ret2, ret3, ret4);

		// 結果を[Move?, Put?]タプルにパース
		let move_hand:Move|null = null;
		let put_hand:Put|null = null;
		if(ret1 == 4){
			put_hand = {
				index: ret2,
				to: new Position(ret3, ret4)
			};
		}else{
			move_hand = {
				from: new Position(ret1, ret2),
				to: new Position(ret3, ret4)
			}
		}
		let hand:[Move|null, Put|null] = [move_hand, put_hand];

		console.log("parsed hand:", hand);

		wasm_is_loaded = true;
	}
);

enum State {
	SelectTurn,
	Playable,
	GameOver,
}

export default function App() {

	// 選択中のAIType
	// const [aiTypeState, setAiTypeState] = useState(AIType.NegaMax3);

	const [aiType, _] = useState([
		AIType.Random,
		AIType.Evaluate,
		AIType.NegaMax3,
		AIType.NegaMax5,
		AIType.WasmNegaMax3,
		AIType.WasmNegaMax5
	])
	const [aiTypeState, setAiTypeState] = useState(AIType.NegaMax3)
	const AddAIType = aiType.map(Add => Add)
	const handleAITypeChange = (e:any) => setAiTypeState((aiType[e.target.value]))
	const getAiTypeName = (aiType:AIType):string => {
		switch(aiType){
			case 0: return "Random: 着手可能手から適当に選びます。";
			case 1: return "Evaluate: 着手可能手の評価関数の高い手を選びます。";
			case 2: return "NegaMax Depth 3: TypeScriptでnegamaxで三手先を評価します。";
			case 3: return "NegaMax Depth 5: negamax 5手先評価です。重いです。";
			case 4: return "wasm NegaMax 3: wasmでNegaMaxで3手先を評価します。";
			case 5: return "wasm NegaMax 5: wasmでnegamaxで5手先評価です。重いです。"
			default:
				throw new Error(`undefined aiType: ${aiType}`);
		}
	}

	// ゲーム状態
	const [gameState, setGameState] = useState(State.SelectTurn)

	// 現在のターン数
	const [currentTurn, setCurrentTurn] = useState(1)

	// 現在のside
	const [currentSide, setCurrentSide] = useState(Side.Free)

    // セル選択状態state
    const [isBoardSelected, setBoardSelected] = useState(false);
    const [selectedBoardPos, setSelectedBoardPos] = useState(new Position(-1,-1));

	// 盤データ
	const [boardData, setBoardData] = useState(new BoardData(InitialBoardData))

	// 手駒状態state
	const [tegomaSideA, setTegomaSideA] = useState(new Array<Koma>())
	const [tegomaSideB, setTegomaSideB] = useState(new Array<Koma>())

	// 盤面評価状態
	const [boardEvaluateData, setBoardEvaluateData] = useState(Evaluate(boardData, tegomaSideA,tegomaSideB))

	// 手駒状態
	const [isTegomaSelected, setTegomaSelected] = useState(false)
	const [selectedTegomaIndex, setSelectedTegomaIndex] = useState(-1)

	// 開始時・ゲームオーバー後の再開時ステートリセット
	const resetGameToPlayable = ()=>{
		// 通常の盤面
		const newBoard = new BoardData(InitialBoardData)

		// デバッグ盤面: サクッと負かす用
		// const newBoard = new BoardData(Debug_InitialBoardData_FastFinish)

		setBoardData(newBoard)
		setBoardEvaluateData(Evaluate(newBoard, tegomaSideA,tegomaSideB))
		setCurrentTurn(1)
		setGameState(State.Playable)
		setTegomaSideA(new Array<Koma>())
		setTegomaSideB(new Array<Koma>())
		ClearUIStates()
	}

	// UI状態クリア
	const ClearUIStates = ()=>{
		setBoardSelected(false)
		setSelectedBoardPos(new Position(-1, -1))
		setTegomaSelected(false)
		setSelectedTegomaIndex(-1)
	}

	// 次のターンへ
	const NextTurn = (newBoardData:BoardData)=>{
		
		// console.log(`NextTurn() called.`)

		ClearUIStates()
		setCurrentTurn(currentTurn + 1)
		setCurrentSide(Utils.ReverseSide(currentSide))
		setBoardData(newBoardData)
		const newBoardEvaluateData = Evaluate(newBoardData, tegomaSideA,tegomaSideB)
		setBoardEvaluateData(newBoardEvaluateData)

		// console.log(`NextTurn(): evaluatedData:`,boardEvaluateData,newBoardEvaluateData,newBoardData)

		// ゲームオーバー評価
		if(
			newBoardEvaluateData.Side(Side.A).state !== EvaluateState.Playable || 
			newBoardEvaluateData.Side(Side.B).state !== EvaluateState.Playable
		){
			setCurrentSide(Side.Free)
			setGameState(State.GameOver)
			return;
		}
	}

	// currentSide stateが更新されたらコンピューター思考開始
	// TODO: warning出ているので正しい使い方じゃなさそう。ただ、NextTurnでそのままコンピューターに渡すとcurrentSideが更新されないのでどう書けばいいのかな、ってなってる
	// React Hook useEffect has a missing dependency: 'ComputerTurn'. Either include it or remove the dependency array
	useEffect(()=>{
		// console.log(`useEffect(): currenSide changed. ${currentSide.toString()}`)

		if(currentSide === Side.B){
			// コンピューター側処理実行
			// ComputerTurn();
			setTimeout(()=>{
				// console.log(`settimeout called. ${currentSide}`)
				if(currentSide === Side.B){
					// コンピューター側処理実行
					ComputerTurn();
				}
			},300)
		}
	},[currentSide])

	// 盤上の駒選択時のステート変更
	const OnBoardCellClicked = (pos:Position)=>{

		// 手駒選択時のmovableクリック時は配置してreturn
		if(isTegomaSelected && boardData.Get(pos).side === Side.Free){
			let newBoardData = boardData.Clone()
			// 選択インデックスの手駒を取得
			const tegoma = tegomaSideA[selectedTegomaIndex]
			// 指定要素を消費
			tegomaSideA.splice(selectedTegomaIndex, 1)
			// 盤に配置
			newBoardData.Set(pos, {koma:tegoma, side:Side.A})
			// 次のターンへ
			NextTurn(newBoardData)
			return;
		}

		// 選択状態による分岐
		if(isBoardSelected){
			if(pos.EqualsTo(selectedBoardPos)){
				// 選択状態から同じセルをクリック → 選択解除
				setSelectedBoardPos(new Position(-1,-1));
				setBoardSelected(false);
			}else if(boardEvaluateData.Side(Side.A).IsMovable(selectedBoardPos, pos)){
				// 選択状態から移動可能セルをクリックした → 移動実行

				// 成るか否か判定
				let promotion = false;
				if(pos.y === 0 && boardData.Get(selectedBoardPos).koma === Koma.Hiyoko){
					promotion = window.confirm("成りますか？")
				}

				// 選択解除
				setSelectedBoardPos(new Position(-1,-1));
				setBoardSelected(false);

				// 移動実行
				MoveAndNextTurn({from:selectedBoardPos, to:pos, promotion:promotion});
			}
		}else{
			if(boardEvaluateData.Side(Side.A).IsSelectable(pos)){
				// 何も選択されていない時に選択可能なセルをクリックした → 選択実行
				setSelectedBoardPos(pos);
				setBoardSelected(true);
			}
		}
	}

	// 手駒選択時のステート変更
	const onTegomaCellClicked = (index:number)=>{
		// 同じ手駒を選択した際は解除
		if(isTegomaSelected && selectedTegomaIndex === index){
			setTegomaSelected(false)
			return;
		}
		setSelectedBoardPos(new Position(-1,-1));
		setBoardSelected(false);
		setTegomaSelected(true);
		setSelectedTegomaIndex(index);
	}

	// 盤上のコマを移動する
	const MoveAndNextTurn = (move:Move) => {
		let newBoardData = boardData.Clone()

		// 移動するセルの情報
		const mover = newBoardData.Get(move.from);
		// 移動したSide情報を獲得
		const side = mover.side;
		// 移動先のセル状態
		const cuptured = newBoardData.Get(move.to);
	
		// 移動先コマがNULLじゃない場合
		if(cuptured.koma !== Koma.NULL){
			// 手駒に移動・ただしNiwatoriはHiyokoとして手駒にする
			if(cuptured.koma === Koma.Niwatori) cuptured.koma = Koma.Hiyoko;

			if(side === Side.A){
				tegomaSideA.push(cuptured.koma)
			}else{
				tegomaSideB.push(cuptured.koma)
			}
		}
	
		// 移動先に移動元をコピー
		newBoardData.Set(new Position(move.to.x,move.to.y), mover)
	
		// 成るフラグが立っている際は移動先のコマを鶏にする
		if(move.promotion === true){
			newBoardData.Get(move.to).koma = Koma.Niwatori
		}
	
		// 移動元をクリア
		newBoardData.Set(move.from, {koma:Koma.NULL, side:Side.Free})

		NextTurn(newBoardData)
	}

	// コンピューター計算時間
	const [computingStartTime, setComputingStartTime] = useState(Date.now)
	const [computingTime, setComputingTime] = useState(0)

	// コンピューターの手番処理
	const ComputerTurn = ()=>{

		// 処理時間表示
		setComputingStartTime(Date.now);

		// AI分岐
		switch(aiTypeState){
			case AIType.Random:
				// AI実行: テスト1: ランダムに手を選ぶAI
				ComputerTurnWithResult(DoRandomAI1(
					tegomaSideB,
					boardData,
					boardEvaluateData
				));
				return;
			case AIType.Evaluate:
				// AI実行: テスト3: 着手可能手を全評価するAIを実行
				ComputerTurnWithResult(DoNormalAI(
					tegomaSideA,
					tegomaSideB,
					boardData,
					boardEvaluateData
				));
				return;
			case AIType.NegaMax3:
				// AI実行: negamax
				ComputerTurnWithResult(
					DoNormalAIWithNegaMax(
						new TemporaryState(Side.B, boardData, tegomaSideA, tegomaSideB, boardEvaluateData)
					)
				);
				return;
			case AIType.NegaMax5:
				// AI実行: negamax
				// TODO: 5手に変更する
				ComputerTurnWithResult(
					DoNormalAIWithNegaMax(
						new TemporaryState(Side.B, boardData, tegomaSideA, tegomaSideB, boardEvaluateData)
					)
				);
				return;
			case AIType.WasmNegaMax3:
				// AI実行: negamax (TODO)
				ComputerTurnWithResult(
					DoNormalAIWithNegaMax(
						new TemporaryState(Side.B, boardData, tegomaSideA, tegomaSideB, boardEvaluateData)
					)
				);
				return;
			case AIType.WasmNegaMax5:
				// AI実行: negamax (TODO)
				ComputerTurnWithResult(
					DoNormalAIWithNegaMax(
						new TemporaryState(Side.B, boardData, tegomaSideA, tegomaSideB, boardEvaluateData)
					)
				);
				return;
			default:
				throw new Error(`undefined ai type : ${aiTypeState}`);
		}
	}

	// コンピューターの処理
	const ComputerTurnWithResult = (result:AIResult)=>{

		// 完了表示にする
		// setComputingProcess(computingTotal);
		setComputingTime(Date.now() - computingStartTime);

		// ゲームオーバー判定が返ってきた
		if(result.withState){
			boardEvaluateData.Side(Side.B).state = result.withState
			setGameState(State.GameOver)
			return;
		}

		// 手駒利用コマンドが返ってきた
		if(result.withPut){
			const put = result.withPut
			let newBoardData = boardData.Clone()
			// 選択された手駒取得
			const tegoma = tegomaSideB[put.index]
			// 選択された手駒を削除
			tegomaSideB.splice(put.index,1)
			// 手駒をセット
			newBoardData.Set(put.to, {koma:tegoma, side:Side.B})
			// 次のターンへ
			NextTurn(newBoardData)
			return;
		}

		// 移動手が返ってきた
		if(result.withMove){
			const move = result.withMove
			// 移動実行
			MoveAndNextTurn(move)
		}
	}

	// 最初の先攻・後攻選択UI
	const renderTurnSelect = ()=>{
		return gameState !== State.SelectTurn ? <></> : renderTurnSelectInner()
	}
	const renderTurnSelectInner = ()=>{
		return (<div className={styles.TurnSelect}>
			<p>先攻・後攻をお選びください。</p>
			<button onClick={()=>{
					setCurrentSide(Side.A)
					resetGameToPlayable()
				}}>先攻で始める</button>
			<button onClick={()=>{
					setCurrentSide(Side.B)
					resetGameToPlayable()
				}}>後攻で始める</button>
		</div>)
	}

	// 結果表示
	const renderGameOver = () =>{
		if(gameState !== State.GameOver) return <></>

        const elements:Array<JSX.Element> = [];
		switch(boardEvaluateData.Side(Side.A).state){
			case EvaluateState.GameOverWithCheckmate:
				elements.push(<p>
					チェックメイトを回避する手がありませんでした。
					コンピューターの勝利です。
				</p>)
				break;
			case EvaluateState.GameOverWithTryable:
				elements.push(<p>
					コンピューターのトライを回避する手がありませんでした。
					コンピューターの勝利です。
				</p>)
				break;
			case EvaluateState.GameOverWithStalemate:
				elements.push(<p>
					手がないか、トライ失敗の手しか残っていませんでした。
					コンピューターの勝利です。
				</p>)
		}
		switch(boardEvaluateData.Side(Side.B).state){
			case EvaluateState.GameOverWithCheckmate:
				elements.push(<p>
					チェックメイトを回避する手がありませんでした。
					あなたの勝利です。
				</p>)
				break;
			case EvaluateState.GameOverWithTryable:
				elements.push(<p>
					あなたのトライを回避する手がありませんでした。
					あなたの勝利です。
				</p>)
				break;
			case EvaluateState.GameOverWithStalemate:
				elements.push(<p>
					手がないか、トライ失敗の手しか残っていませんでした。
					あなたの勝利です。
				</p>)

		}
		elements.push(<p>続けてプレイ:</p>)
		elements.push(renderTurnSelectInner())
		return elements
	}

	const renderStatus = () => {
        const elements:Array<JSX.Element> = [];

		const evalData = boardEvaluateData.Side(Side.A)
		switch(evalData.state){
			case EvaluateState.Playable:
				if(evalData.isCheckmate){
					elements.push(<div className="notice">
						チェックメイトされています！
					</div>)
				}
				if(evalData.isEnemyTryable){
					elements.push(<div className="notice">
						相手がトライ直前です！
					</div>)
				}
				break;
		}
		elements.push(<div>CPU処理時間: {computingTime / 1000}秒</div>)
		
		return elements
	}

	const renderSide = ()=>{
		switch(currentSide){
			case Side.A: return <p>あなたの番です。</p>
			case Side.B: return <p>コンピューターの思考中です。</p>
		}
		return <></>
	}
	
	return (
		<div className={styles.App}>
			<header>どうぶつしょうぎ</header>
			{renderTurnSelect()}
			<div className={styles.GameView}>
				<div>
					{/* メインの将棋盤 */}
					<Board
						boardData={boardData}
						isBoardSelected={isBoardSelected}
						boardEvaluateData={boardEvaluateData}
						selectedBoardPos={selectedBoardPos}
						onCellClicked={OnBoardCellClicked}
						isTegomaSelected={isTegomaSelected}
						currentSide={currentSide}
						/>
				</div>
				<div>
					{/* 手駒、情報枠 */}
					<Infomation
						tegomaSideA={tegomaSideA}
						tegomaSideB={tegomaSideB}
						isTegomaSelected={isTegomaSelected}
						selectedTegomaIndex={selectedTegomaIndex}
						onTegomaCellClicked={onTegomaCellClicked}
						currentTurn={currentTurn}
						currentSide={currentSide}
						boardEvaluateData={boardEvaluateData}
						/>
				</div>
			</div>
			AI選択 : 
				<select
					value={aiTypeState}
					onChange={e => handleAITypeChange(e)}>
				{
					AddAIType.map((aiType, key) => <option value={key}>{getAiTypeName(aiType)}</option>)
				}
				</select>
			<div className={styles.header}>
				turn={currentTurn}<br />
				{renderSide()}
				{renderStatus()}
			</div>
			{renderGameOver()}
		</div>
	);
}

