/**
 * 一般定数
 * - 純粋なenumや定数を置く場所
 */

import { CellData } from "../components/Cell";

export enum AIType {
    Random,
    Evaluate,
    NegaMax3,
    NegaMax5,
    WasmNegaMax3,
    WasmNegaMax5,
}

// どちらサイドの駒かを判別するenum
export enum Side{
    Free = 0,
    A = -1, // TODO: 名前ミスったかも。下サイドの意味で使っていて、実質プレイヤー
    B = 1
}

// セルに置かれている駒種別を示すenum
export const enum Koma{
	NULL,
	Lion,
	Kirin,
	Zou,
	Hiyoko,
	Niwatori
}

// 初期の盤面状態
export const InitialBoardData:Array<Array<CellData>> = [[
    {
        side: Side.B,
        koma: Koma.Kirin
    },
    {
        side: Side.B,
        koma: Koma.Lion
    },
    {
        side: Side.B,
        koma: Koma.Zou
    },
],[
    {
        side: Side.Free,
        koma: Koma.NULL
    },
    {
        side: Side.B,
        koma: Koma.Hiyoko
    },
    {
        side: Side.Free,
        koma: Koma.NULL
    },
],[
    {
        side: Side.Free,
        koma: Koma.NULL
    },
    {
        side: Side.A,
        koma: Koma.Hiyoko
    },
    {
        side: Side.Free,
        koma: Koma.NULL
    },
],[
    {
        side: Side.A,
        koma: Koma.Zou
    },
    {
        side: Side.A,
        koma: Koma.Lion
    },
    {
        side: Side.A,
        koma: Koma.Kirin
    },
]];


// デバッグ用初期盤面
// - サクッとランダムAIを負かす用
export const Debug_InitialBoardData_FastFinish:Array<Array<CellData>> = [[
    {
        side: Side.Free,
        koma: Koma.NULL
    },
    {
        side: Side.B,
        koma: Koma.Lion
    },
    {
        side: Side.Free,
        koma: Koma.NULL
    },
],[
    {
        side: Side.Free,
        koma: Koma.NULL
    },
    {
        side: Side.Free,
        koma: Koma.NULL
    },
    {
        side: Side.Free,
        koma: Koma.NULL
    },
],[
    {
        side: Side.A,
        koma: Koma.Kirin
    },
    {
        side: Side.A,
        koma: Koma.Hiyoko
    },
    {
        side: Side.A,
        koma: Koma.Zou
    },
],[
    {
        side: Side.A,
        koma: Koma.Zou
    },
    {
        side: Side.A,
        koma: Koma.Lion
    },
    {
        side: Side.A,
        koma: Koma.Kirin
    },
]];

// 盤上にある駒の評価用点数
// memo: 過去実装の定義値をそのまま流用……エビデンスは不明
// - 多分「持ってたらこれくらい有利かな」と言う気持ちで入れた数字
export const KomaScore = {
	0: -999999, // NULL - 評価してはいけないのでエラー検知用のマイナス値にしておく
	1: 0, // Lion なくなる可能性はないし点評価デバッグで目障りなので0にする
	2: 100, // Kirin
	3: 100, // Zou
	4: 75, // Hiyoko
	5: 110, // Niwatori
};

// 手駒として所持している駒の評価用点数
// memo: 過去実装の定義値をそのまま流用……エビデンスは不明
// - 多分「持ってたらこれくらい有利かな」と言う気持ちで入れた数字
export const TegomaScore = {
	0: -999999, // NULL - 評価してはいけないのでエラー検知用のマイナス値にしておく
	1: -999999, // Lion - 手駒になってはいけないのでエラー検知用のマイナス値にしておく
	2: 150, // Kirin
	3: 150, // Zou
	4: 100, // Hiyoko
	5: -999999, // Niwatori - 手駒になってはいけないのでエラー検知用のマイナス値にしておく
};

//ライオンが前に出た場合の1行あたりのスコア
export const LionLineScore = 140 ;

//「効く位置」いっこあたりのスコア
export const AttackablePosScore = 30 ;

// 着手可能手一つあたりのスコア
export const EnableMoveScore = 30;

// トライ可能時のスコア
export const TryableScore = 250;

// チェックメイト時のスコア
export const CheckmateScore = 200;