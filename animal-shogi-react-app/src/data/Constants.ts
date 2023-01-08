/**
 * 一般定数
 * - 純粋なenumや定数を置く場所
 */

import { CellData } from "../components/Cell";

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