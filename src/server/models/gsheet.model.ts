export interface GSheetSheet {
  properties: GSheetSheetProps;
}
export interface GSheetSheetProps {
  sheetId:        number;
  title:          string;
  index:          number;
  sheetType:      string;
  gridProperties: GSheetGridProps;
}

export interface GSheetGridProps {
  rowCount:    number;
  columnCount: number;
}
