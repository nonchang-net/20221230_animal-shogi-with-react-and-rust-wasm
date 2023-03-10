# 20221230_animal_shogi_wasm_test

## 概要

- 過去にPure JavaScriptで実装した「20130223_どうぶつしょうぎ」を、react+TypeScriptで実装を整理して、かつ評価関数周りのロジックをRust+wasm実装に置き換えるという学習プロジェクトです。
	- オリジナルの実装は色々と恥ずかしいので割愛しています。

- 学習メモを自分の備忘録がてら、雑多に残しています。
	- 多分このリポジトリ並びに本文章の内容は、今後保守しないとは思います。ご容赦ください。

## React + TypeScriptにした理由

- Vanilla JavaScriptはvscodeで型補完が効かないのが辛いので採用。
- better javascript扱いで。
	- TypeScript固有の機能は、目についた便利機能を試す程度で深追いはしない方針。
	- ちゃんとしたTypeScriptの復習はまた後日、別の機会に。

## 実装方針などメモ

- TypeScriptを導入する
	- Reactの文脈外の要素は素のTypeScriptで記述
	- 今回は評価処理側と共有するデータ構造と、評価ロジックの実装自体をpure TypeScriptに分割。
		- これができたらwasmとのデータ連携方法を考えていく

- React
	- Functional Component(関数コンポーネント)で実装
		- https://qiita.com/otanu/items/434cd326754ac989fcbe
		- React Hooks以降、これが一番工数が少なく記述量も少ないシンプルな方法と判断。
	- React Hooks周りはまだよくわかってないところも多いので、今回必要になりそうな機能を把握していきたい。
		- [フックの導入](https://ja.reactjs.org/docs/hooks-intro.html)

- ロジック類だけJestのテストコードを揃えていく。
	- テストファイルは元ファイルと同じ場所に置く。
	- ex: Utils.tsのテストはUtils.test.ts。


## UI面の考え方メモ

- このゲームのセル周りのUI状態は以下の三種類がある。
	- 操作できない時
		- wasm初期化中、CPU計算中など。
		- クリックイベント・hoverイベントが解除された状態として判別可能。
	- 操作可能なコマをクリックできる状態
		- 自分のターン。
		- 操作可能なコマにhoverすると、移動可能先も弱くハイライトされる。
		- （初期実装しないかも） undo/redoボタンが推せる状態になっている。
	- 操作可能なコマを選択した状態
		- これも自分のターン。
		- isSelected的なフラグ判定が必要だろう。
		- 移動可能先が強くハイライトされている。
		- 選択状態のキャンセル手段として、選択したコマをクリックすると元に戻る。
			- 移動できないセルのクリックでキャンセルしてもいいけど、誤解を招くかも？

- この他の要素の検討
	- 起動直後は「先手か後手か」を選べる
	- 自分のターンでは常時undo/redoボタンを推せる
	- リセットボタンもいつでも押せる
	- ゲームが完了したら、もう一度プレイ:「先手」「後手」の表示
	- 先手・後手選択時には、AIにwasmを使うかTypeScript実装とするか選べるように？
	- 探索深さを設定できるようにする？ 以前のjQuery実装では三手先まで検索していた。

## TypeScriptの型宣言周りの復習

- 普段Better JavaScriptとしてしかTypeScriptを使ってないので、今回は盤情報をちゃんと型定義して進められるように復習しておく。
	- TypeScriptの型システムは複雑なので、厳密なところは割愛して理解が速く済む記述を優先して後でもっといい書き方がわかったら直す、という指針でゆるふわに進める（予防線）。

	- [TypeScriptの型入門](https://qiita.com/uhyo/items/e2fdef2d3236b9bfe74a)
		- 2018の記事だけど基本は抑えられてそうなので読む。感謝。
		- リテラル型は今回出番はないかな。

	- ゲームに必要な型を考える。
		- セルはICellDataインターフェースで、sideとkomaのenum値のペアから仮組を始める。
		- 盤情報ICellDataの3x4の配列。これはどう記述すればいいのかな。
			- `Array<Array<ICellData>>`でいいのかな。
			- これをtype BoardDataと定義して先に進めてみる。
		- `保留` ヒストリとして棋譜を保存したい。
			- 盤状態の配列だとデータが太るので、今回は「動かすものの座標」＋「動かす先」だけを情報として持つ配列を定義。
				- 「0,1,0,2」で「座標(0,1)のコマを座標(0,2)に動かす」と表現。
			- ただ、「動かすもの」には手駒も含まれるので表現ルールを決める。
				- 手駒は自動で並び替えられないものとし、入手順に座標4に配列として並べられるものとする。
				- 「4,0,0,2」で「手駒4列から、手持ちインデックス0番の駒を、座標(0,2)に打つ」と表現。
				- 成るか否かの表現は、追加フラグを持たせるしかないので、最後にbooleanを付与。
				- 「0,1,0,2,false」というデータ構造になる。

## ReactのCSSの基本的なところ復習

- 20221231現在、過去にReact Native案件を少し触ったくらいでReactでの成果物がない状態。
	- まずReactでのCSSの考え方を軽く調べる。
	- [Reactにおけるスタイリング手法まとめ](https://zenn.dev/chiji/articles/b0669fc3094ce3)
		- 2021の記事。こちらを参考に。感謝。

		- `グローバルスタイル`。
			- 一番余計な処理が絡まないやつ。
			- cssをimportすれば使える。
			- グローバルなので名前衝突に注意。
			- 階層化できれば十分そうだけどないのかな。

		- `styleプロップ`
			- `<div style={{ height: 10 }}>`
			- 再レンダリングのたびに評価され、パフォーマンスロスがあるとのこと。
			- 小さいアプリで突貫工事するくらいなら良いか。中規模開発になるなら利用を避けたい。
			- 変数使えるのかな。
			- 疑似クラスやメディアクエリにも対応してない点も注意。

		- `CSS Modules`
			- `import styles from './Button.module.css'`
			- `className={styles.error}`
			- 標準で使える。css名は「.module.css」としないと機能しないので注意。
			- 名前衝突を避けられるならこれでいい気がする。
			- ファイル分ける必要がある点は、細かいコンポーネント量産時にはちょっと手間。
				- （まあそれくらい我慢しろよと思わなくもないw
			- Next.jsでずっと使われているとか。
			- 将来性を不安視する記述もあるけど、無くなる頃には代替が出てきてるだろうし今回のテストアプリでは懸念する必要はないかなと。
				- https://ramble.impl.co.jp/1414/

		- `CSS-in-JS`
			- 何かしら追加導入しないといけないのかな。
			- あれ、React Nativeの時は標準でも「StyleSheet.create()」が使えたと思うんだけども……。
			- 今回はスルー。

	- 今回の判断
		- 今回はcreate-react-app生成状態から極力追加モジュールなしで進めたいこともあり、CSS Modulesで。

- 20230102: reactでclassNameを複数設定する方法をメモ
	- 今回はアニメーション類を使うわけでもないので、極力CSSの張り替えだけで表現を完了させたく。
		- この辺を把握してなかったので調べる。
		- [【React】classNameでよく使う定義方法(複数クラス、条件付きクラス)](https://nishinatoshiharu.com/classname-pattern/)
			- 空白区切り。
			- ```className={`${size === "s" ? styles.btnSmall : styles.btnLarge}`}```
			- うーん。つまり、あまり綺麗ではない気がするものの 
				```js
					<div className={`
						${styles.cell}
						${props.cellData.side == Side.B ? styles.invert : ""}
					`} onClick={testOnClick}>
				```
			- という書き方で、条件指定で追加クラスを設定することは可能っぽい。
			- 目的は達成できたので、一旦これで。もっといい書き方がありそうな気はする。
			- `classnames`追加モジュール導入は避けておく。そこまで利便性が上がる感じでもなさそうなので。

- CSS実装方針メモ
	- 元プロジェクトが昔ながらのtableレイアウトだったので、flex/gridレイアウトに置き換えておく。
		- CSS自体のトレンドは深追いせず、tableレイアウトを捨てることだけを考える方針で。

## 初回セットアップ手順メモ

※以下の情報は、今回の作業環境を構築するまでの手順メモです。

- 20221230:

	- githubでリポジトリ作成、clone。
		- 「20221230_animal-shogi-with-react-and-rust-wasm」とした。長い。

	- まず手元環境のアップデート
		- create-react-appはどうも手元環境のVenturaだと、過去のセットアップが古くてエラーになった。
		- まずnで最新のnode導入。
		- sudo n latest
		> ❯ node -v
			v19.3.0

	- npx create-react-app animal-shogi-react-app
		- できた。案内に任せて、
		> cd animal-shogi-react-app
		> npm start
		- で起動した。ただ、TypeScriptじゃない。一旦捨てる。

	- npx create-react-app animal-shogi-react-app --template typescript
		- できた。ok。
		- あとは`npm start`でオートリロード体制。



`EOF`