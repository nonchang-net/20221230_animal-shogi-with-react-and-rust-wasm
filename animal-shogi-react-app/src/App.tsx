import { useEffect, useState } from 'react';
import styles from './css/App.module.css';

import Board from './components/Board';
import Infomation from './components/Infomation';

import { InitialBoardData, Koma, Side } from './data/Constants';
import Utils, { Position } from './Utils';
import { Evaluate } from './data/BoardEvaluateData';
import { BoardData } from './data/BoardData';


// UI応答
export default function App() {

	// const firstSide = window.confirm("先手で始めますか？") ? Side.A : Side.B;

	// 現在のターン数
	const [currentTurn, setCurrentTurn] = useState(1)

	// 現在のside
	// TODO: 初期サイドの選択UIをどうしようか
	const [currentSide, setCurrentSide] = useState(Side.A)

    // セル選択状態state
    const [isBoardSelected, setBoardSelected] = useState(false);
    const [selectedBoardPos, setSelectedBoardPos] = useState(new Position(-1,-1));

	// 盤データ
	const [boardData, setBoardData] = useState(new BoardData(InitialBoardData))

	// 盤面評価状態
	const [boardEvaluateData, setBoardEvaluateData] = useState(Evaluate(boardData))

	// 手駒状態state
	// undone: そういえば何も考えずにpushしたら更新されるなこれ？
	// undone: Side enumで取り分けるメソッドが欲しいかな……
	const [tegomaSideA, setTegomaSideA] = useState(new Array<Koma>())
	const [tegomaSideB, setTegomaSideB] = useState(new Array<Koma>())

	// 手駒状態
	const [isTegomaSelected, setTegomaSelected] = useState(false)
	const [selectedTegomaIndex, setSelectedTegomaIndex] = useState(-1)

	// ターンチェンジ副作用検知
	useEffect(() => {
		if(currentSide === Side.A){
			return;
		}

		// コンピューター側処理実行
		console.log("Next() : computer turn here.")
		ComputerTurn();

		console.log("Next() : done. back to player.")
		setCurrentSide(Side.A)
		setCurrentTurn(currentTurn + 1)
		return;
	});

	// 盤上の駒選択時のステート変更
	const OnBoardCellClicked = (pos:Position)=>{
		// console.log("onClicked() ",pos.x, pos.y, Get(pos))
		// console.log("onClicked() enableMoves? ", Sides[Side.A].enableMoves)
		// console.log("playerSelectablePositions:", playerSelectablePositions)
		
		// console.log("onClicked() isSelected", isSelected, selectedPos)
		// console.log("onClicked() GetMovablesByPos()", GetMovablesByPos(pos))

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

			if(side == Side.A){
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

		// hooks経由でstate更新
		setBoardData(newBoardData)

		// boardEvaluateDataのstate更新
		setBoardEvaluateData(Evaluate(boardData))
	
		// 次のターンへ
		// setCurrentSide(Utils.ReverseSide(currentSide))
		Next()
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

		// hooks経由でstate更新
		setBoardData(newBoardData)

		// boardEvaluateDataのstate更新
		setBoardEvaluateData(Evaluate(boardData))

		// 手駒選択状態解除
		setTegomaSelected(false)
		setSelectedTegomaIndex(-1)

		// 次のターンへ
		// setCurrentSide(Utils.ReverseSide(currentSide))
		Next()
	}

	const Next = ()=>{
		// console.log("Next() : side=",currentSide)

		// useEffect経由でコンピューターのターンを処理する
		setCurrentTurn(currentTurn + 1)
		setCurrentSide(Side.B)
	}

	// コンピューターの手番処理
	// - useEffect経由で実行
	const ComputerTurn = ()=>{
		// TODO: 本来はAIを呼び出す局面
		// - boardのEvaluateは終わっているので、試しに着手可能手をランダムに一つ選んで適用していく

		const enableMoves = boardEvaluateData.Side(Side.B).enableMoves;

		// 着手可能手がない場合はパス
		if(enableMoves.length === 0){
			Next()
		}

		// ランダムに着手可能手を盤面から選ぶ
		const move = enableMoves[Utils.RandomRange(enableMoves.length)]

		// TODO: 「手駒の配置」も着手可能手として評価したい

		// ヒヨコでy=3を選んだ際は、コンピューターは常時promotionする
		const promotion = (
			boardData.Get(move.from).koma === Koma.Hiyoko &&
			move.to.y === 3
		)

		// 移動実行
		Move(move.from, move.to, promotion)
	}
	
	return (
		<div className={styles.App}>
			<header>どうぶつしょうぎ</header>
			<div className={styles.GameView}>
				<div>
					{/* メインの将棋盤 */}
					<Board
						boardData={boardData}
						isBoardSelected={isBoardSelected}
						boardEvaluateData={boardEvaluateData}
						setBoardSelected={setBoardSelected}
						selectedBoardPos={selectedBoardPos}
						setSelectedBoardPos={setSelectedBoardPos}
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
						/>
				</div>
			</div>
		</div>
	);
}

