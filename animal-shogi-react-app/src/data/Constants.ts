/**
 * 一般定数
 * - 純粋なenumや定数を置く場所
 */

// どちらサイドの駒かを判別するenum
export enum Side{
    Free = 0,
    A = -1,
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