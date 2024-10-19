import { SearchOption, selectOption } from "./../utils/tableMixin";
export interface TimeSpan {
  start: string;
  end: string;
}
export interface pagination {
  filters: string;
  page: number;
  rowsPerPage: number;
  type?: number; // 系統設定所用
  id?: number; // 管委會查詢所用
  deviceId?: number; // 設備清單 所用
  userId?: string; // 帳號 所用
  floorId?: number; // 地址所用
  buildingId?: number; // 樓層所用
  routineId?: number; // 例行檢查所用
  maintainId?: number; // 維保細項所用
  deviceMaintainId?: number; // 維保事件處理紀錄所用
  tab?: string; // 公告欄用
  roleName?: string; // 任務列表用
}

export interface tempDataType {
  [index: string]: any;
}

export interface ApiResponse<T> {
  pageName?: string | null;
  localUrl?: string | null;
  errors?: { [key: string]: string } | null; // ? 不確定格式
  routeValues?: string | null; // ? 不確定格式
  data: T;
}

export type ApiRowsResponse<T> = ApiResponse<{
  rows: T;
  rowsNumber: number;
}>;

// 進階搜尋
export enum FilterTypes {
  Equals,
  Contains,
  BetweenDateTime,
  BetweenInt,
  Flags,
  BetweenDateOnly,
  NotNull,
  EqualsRaw,
}
export interface FilterColumnKey {
  typeName: string;
  fieldName: string;
}
export enum FilterColumnLogical {
  And,
  Or,
}
export interface FilterColumn {
  logical: FilterColumnLogical;
  columnKey: FilterColumnKey;
  beginValue?: string | Date;
  endValue?: string | Date;
  value?: selectOption["value"];
}

export interface FilterColumnCollection {
  logical: FilterColumnLogical;
  columns: FilterColumn[];
}

export interface StringFilterOption {
  label: string;
  val: string;
  type?: string;
}

export interface StringFilter {
  title: string;
  type: string;
  options: StringFilterOption[];
  model: string[];
}

export interface DateFilter {
  title: string;
  type: string;
  dateRangeModel: { from: string; to: string };
  searchOption: SearchOption;
}

export interface SingleSelectFilter {
  title: string;
  type: string;
  model: selectOption | undefined;
  searchOption: SearchOption;
}

export type filtersTypeUnion = StringFilter | DateFilter | SingleSelectFilter;
export type filtersType = filtersTypeUnion[];

export function isStringFilter(
  filter: filtersTypeUnion
): filter is StringFilter {
  return "options" in filter && "model" in filter;
}

export function isDateFilter(filter: filtersTypeUnion): filter is DateFilter {
  return (
    "dateRangeModel" in filter &&
    "searchOption" in filter &&
    ("startVal" in filter.searchOption || "endVal" in filter.searchOption)
  );
}
export function isSingleSelectFilter(
  filter: filtersTypeUnion
): filter is SingleSelectFilter {
  return (
    "searchOption" in filter &&
    "options" in filter.searchOption &&
    "model" in filter
  );
}
