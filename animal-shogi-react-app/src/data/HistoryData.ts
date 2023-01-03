// ヒストリ情報
// - targetは動かす元の座標x/y。
//   - 座標xに「4」が指定された際は、yで手駒インデックスを指定する
// - mobeToは動かす先の座標x/y
// - promotionは成るか否か
// あくまで操作それ自体の配列で表現し、ルールに沿った動作かどうかはデータとしては持たない。
export interface IHistoryData{
    target: [number, number]
    moveTo: [number, number]
    promotion: boolean
}

// ヒストリ型: ただのIHisotyrDataの配列
export type HistoriesData = Array<IHistoryData>;