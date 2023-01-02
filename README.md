# 20221230_animal_shogi_wasm_test

## 概要

- 過去にPure JavaScriptで実装した「20130223_どうぶつしょうぎ」を、react+TypeScriptで実装を整理して、かつ評価関数周りのロジックをRust+wasm実装に置き換えるという学習プロジェクトです。
	- オリジナルの実装は色々と恥ずかしいので割愛しています。

- 学習メモを雑多に残しています。

## React + TypeScriptにした理由

- Vanilla JavaScriptはvscodeで型補完が効かないのが辛いので。
- TypeScript固有の機能は深追いせず。

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
		- ヒストリとして棋譜を保存したい。
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