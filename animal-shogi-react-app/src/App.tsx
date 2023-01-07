import { useEffect, useState } from 'react';
import styles from './css/App.module.css';

import Board from './components/Board';
import Infomation from './components/Infomation';

import { InitialBoardData, Koma, Side } from './data/Constants';
import Utils, { Position } from './Utils';
import { Evaluate, EvaluateState } from './data/BoardEvaluateData';
import { BoardData } from './data/BoardData';


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
		const newBoard = new BoardData(InitialBoardData)
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
		setBoardEvaluateData(Evaluate(newBoardData))

		// ゲームオーバー評価
		if(
			boardEvaluateData.Side(Side.A).state !== EvaluateState.Playable || 
			boardEvaluateData.Side(Side.B).state !== EvaluateState.Playable
		){
			setGameState(State.GameOver)
			return;
		}
	}

	// currentSide stateが更新されたらコンピューター思考開始
	// TODO: warning出ているので正しい使い方じゃなさそう。ただ、NextTurnでそのままコンピューターに渡すとcurrentSideが更新されないのでどう書けばいいのかな、ってなってる
	useEffect(()=>{
		// console.log(`useEffect(): currenSide changed. ${currentSide.toString()}`)

		if(currentSide === Side.B){
			// コンピューター側処理実行
			ComputerTurn();
		}
	},[currentSide])

	// 盤上の駒選択時のステート変更
	const OnBoardCellClicked = (pos:Position)=>{

		// 手駒選択時のmovableクリック時は配置してreturn
		if(isTegomaSelected && boardData.Get(pos).side === Side.Free){
			SetTegoma(pos)
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
				Move(selectedBoardPos, pos, promotion);

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
	const Move = (from:Position, to:Position, promotion:boolean = false) => {
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

	// 手駒配置処理
	const SetTegoma = (pos:Position):void =>{
		let newBoardData = boardData.Clone()

		// 手駒の選択インデックスのコマを取得
		const tegoma = tegomaSideA[selectedTegomaIndex]

		// 指定要素を削除
		tegomaSideA.splice(selectedTegomaIndex, 1)

		// 盤に配置
		newBoardData.Set(pos, {koma:tegoma, side:Side.A})

		NextTurn(newBoardData)
	}

	// コンピューターの手番処理
	const ComputerTurn = ()=>{
		// TODO: 本来はAIを呼び出す局面
		// - boardのEvaluateは終わっているので、試しに着手可能手をランダムに一つ選んで適用していく

		// console.log(`ComputerTurn() called.`)

		if(tegomaSideB.length !== 0){
			// 手駒があれば積極的に使う
			let newBoardData = boardData.Clone()
			let tegoma = tegomaSideB.pop() as Koma
			const allPos = boardData.SearchAllNull()
			const pos = allPos[Utils.RandomRange(allPos.length)]
			newBoardData.Set(pos, {koma:tegoma, side:Side.B})

			NextTurn(newBoardData)
			return;
		}

		const enableMoves = boardEvaluateData.Side(Side.B).enableMoves;

		// ステイルメイト: 着手可能手がない？
		// - wikipediaによれば、どうぶつしょうぎでチェックメイトされていなくて動ける場所がないという状況は発生しない？
		// - 
		if(enableMoves.length === 0){
			console.error(`ステイルメイト: 最終的にはここには来ないはず？ 一旦ゲームオーバー扱いにします`)
			boardEvaluateData.Side(Side.B).state = EvaluateState.GameOverWithCheckmate;
			setGameState(State.GameOver)
			return
		}

		// ランダムに着手可能手を盤面から選ぶ
		const move = enableMoves[Utils.RandomRange(enableMoves.length)]

		// ヒヨコでy=3を選んだ際は、コンピューターは常時promotionする
		const promotion = (
			boardData.Get(move.from).koma === Koma.Hiyoko &&
			move.to.y === 3
		)

		// 移動実行
		Move(move.from, move.to, promotion)
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
					相手のトライを回避する手がありませんでした。
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
					相手のトライを回避する手がありませんでした。
					あなたの勝利です。
				</p>)
		}
		elements.push(<p>続けてプレイ:</p>)
		elements.push(renderTurnSelectInner())
		return elements
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
			{renderGameOver()}
		</div>
	);
}

