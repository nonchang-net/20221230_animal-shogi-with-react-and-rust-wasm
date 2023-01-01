# 20221230_animal_shogi_wasm_test

## 概要

- 過去にPure JavaScriptで実装した「20130223_どうぶつしょうぎ」を、react+TypeScriptで実装を整理して、かつ評価関数周りのロジックをRust+wasm実装に置き換えるという学習プロジェクトです。
	- オリジナルの実装は色々と恥ずかしいので割愛しています。

- 学習メモを雑多に残しています。

## React + TypeScriptにした理由

- Vanilla JavaScriptはvscodeで型補完が効かないのが辛いので。
- TypeScript固有の機能は深追いせず。

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