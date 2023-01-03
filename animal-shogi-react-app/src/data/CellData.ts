import {Side, Koma} from './Constants';

// export interface ICellData{
//     side: Side;
//     koma: Koma;
// }

// export class CellData{
//     side: Side = Side.Free;
//     koma: Koma = Koma.NULL;
// }

export type CellData={
    side: Side;
    koma: Koma;
}