import { useEffect, useState } from 'react';
import styles from './css/App.module.css';

import Board from './components/Board';
import Infomation from './components/Infomation';

import { Debug_InitialBoardData_FastFinish, InitialBoardData, Koma, Side } from './data/Constants';
import Utils, { Position } from './Utils';
import { Evaluate, EvaluateState } from './data/BoardEvaluateData';
import { BoardData } from './data/BoardData';
import { AIResults, DoRandomAI1, DoRandomAI1WithMultipleSequence } from './ai/AiBase';


enum State {
	SelectTurn,
	Playable,
	GameOver,
}

export default function App() {

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

	// 盤面評価状態
	const [boardEvaluateData, setBoardEvaluateData] = useState(Evaluate(boardData))

	// 手駒状態state
	const [tegomaSideA, setTegomaSideA] = useState(new Array<Koma>())
	const [tegomaSideB, setTegomaSideB] = useState(new Array<Koma>())

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
		setBoardEvaluateData(Evaluate(newBoard))
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
		const newBoardEvaluateData = Evaluate(newBoardData)
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
				MoveAndNextTurn(selectedBoardPos, pos, promotion);
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
	const MoveAndNextTurn = (from:Position, to:Position, promotion:boolean = false) => {
		let newBoardData = boardData.Clone()

		// 移動するセルの情報
		const mover = newBoardData.Get(from);
		// 移動したSide情報を獲得
		const side = mover.side;
		// 移動先のセル状態
		const cuptured = newBoardData.Get(to);
	
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
		newBoardData.Set(new Position(to.x,to.y), mover)
	
		// 成るフラグが立っている際は移動先のコマを鶏にする
		if(promotion){
			newBoardData.Get(to).koma = Koma.Niwatori
		}
	
		// 移動元をクリア
		newBoardData.Set(from, {koma:Koma.NULL, side:Side.Free})

		NextTurn(newBoardData)
	}

	// コンピューター計算中かどうか
	const [isComputing, setComputing] = useState(false)
	const [computingProcess, setComputingProcess] = useState(0)
	const [computingTotal, setComputingTotal] = useState(0)
	const [computingCount, setComputingCount] = useState(0)
	const [computingStartTime, setComputingStartTime] = useState(Date.now)
	const [computingTime, setComputingTime] = useState(Date.now)

	// コンピューターの手番処理
	const ComputerTurn = ()=>{
		// 再帰呼び出し
		// - 一発で結果が返ってくれば一撃で完了する

		const recursiveCall = (result:AIResults)=>{
			if(result.withNext){
				if(!isComputing){
					setComputing(true)
					setComputingStartTime(Date.now)
				}
				const [current,total,count,Next] = result.withNext;
				setComputingProcess(current)
				setComputingTotal(total)
				setComputingCount(count)
				setComputingTime(Date.now() - computingStartTime);
				// console.log(`withNext() ${current}/${total} (${count})`)
				setTimeout(()=>{
					// ちょっとUI側で待機してから再実行する
					recursiveCall(Next())
				},100)
			}else{
				// setComputing(false) // 結果は表示し続けるためコメントアウト中

				// 完了表示にする
				setComputingProcess(computingTotal)
				setComputingTime(Date.now() - computingStartTime);

				// AI結果を適用
				ComputerTurnWithResult(result)
			}
		}

		// AI実行: テスト1: 一瞬で応答を返すランダムAI
		// recursiveCall(DoRandomAI1(
		// 	tegomaSideB,
		// 	boardData,
		// 	boardEvaluateData
		// ));

		// AI実行: テスト2: 10回進捗情報を返してから完了応答を返すランダムAI
		setComputingStartTime(Date.now)
		recursiveCall(DoRandomAI1WithMultipleSequence(
			tegomaSideB,
			boardData,
			boardEvaluateData
		));
	}

	// コンピューターの処理: 最終的にAIが結果を返したら
	const ComputerTurnWithResult = (result:AIResults)=>{

		// ゲームオーバー判定が返ってきた
		if(result.withState){
			boardEvaluateData.Side(Side.B).state = result.withState
			setGameState(State.GameOver)
			return;
		}

		// 手駒利用コマンドが返ってきた
		if(result.withPut){
			const [index,pos] = result.withPut
			let newBoardData = boardData.Clone()
			// 選択された手駒取得
			const tegoma = tegomaSideB[index]
			// 選択された手駒を削除
			tegomaSideB.splice(index,1)
			// 手駒をセット
			newBoardData.Set(pos, {koma:tegoma, side:Side.B})
			// 次のターンへ
			NextTurn(newBoardData)
			return;
		}

		// 移動手が返ってきた
		if(result.withMove){
			const [from,to,promotion] = result.withMove
			// 移動実行
			MoveAndNextTurn(from, to, promotion)
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
		if(isComputing){
			elements.push(<div>CPU: {computingProcess}/{computingTotal} ({computingCount}) 経過時間: {computingTime}ms</div>)
		}
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
			<div className={styles.header}>
				turn={currentTurn}<br />
				{renderSide()}
				{renderStatus()}
			</div>
			{renderGameOver()}
		</div>
	);
}

