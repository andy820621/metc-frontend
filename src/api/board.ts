import { req } from 'boot/axios';
import {
  FilterTypes,
  type ApiResponse,
  type ApiRowsResponse,
  type pagination,
} from './api.type';
import type { NotifyViewModel } from './notify';
import type { RoleViewModel } from './role';
export enum BoardLabels {
  'Announcement' = '公告區',
  'Removal' = '下架區',
  'Download' = '相關下載',
  'Past' = '歷屆名冊',
  'Community' = '管委會公告',
  'Matter' = '災害注意宣導事項',
}
export enum BoardTypes {
  None = 0,
  // 相關下載
  Download = 1,
  // 歷屆名冊
  Past = 2,
  // 管委會公告
  Community = 4,
  // 災害注意宣導事項
  Matter = 8,
  // 一般公告
  Normal = 16,
}
export interface BoardNotifyViewModel {
  role: RoleViewModel;
  notify?: NotifyViewModel | null;
}

export interface BoardViewModel {
  id?: number;
  title: string;
  content: string;
  start: string;
  end: string;
  marqueeEnabled: boolean;
  marquee?: string;
  top: boolean;
  type: BoardTypes;
  frontCoverFileId?: number;
  frontCoverFilePath?: string;
  boardNotifies?: BoardNotifyViewModel[];
}
export function BoardTypesChangeToCh(row: BoardViewModel) {
  const numberArr = Object.values(BoardTypes)
    .filter((value) => typeof value !== 'string')
    .map((value) => value);
  const typeCh: string[] = [];
  numberArr.forEach((num) => {
    const result = Number(row.type) & Number(num);
    if (result === Number(num)) {
      const enName = BoardTypes[num as unknown as keyof typeof BoardTypes];
      const chName = BoardLabels[enName as unknown as keyof typeof BoardLabels];
      if (chName) typeCh.push(chName);
    }
  });

  return typeCh.join('、');
}
const Board = {
  // 新增公告欄
  apiPostData(payload: BoardViewModel[]) {
    return req<ApiResponse<number>>('post', '/Board', payload);
  },
  // 修改公告欄
  apiPatchData(payload: BoardViewModel[]) {
    return req<ApiResponse<{ [key: string]: boolean }>>(
      'patch',
      '/Board',
      payload,
    );
  },
  // 查詢公告欄
  apiGetData(payload: pagination) {
    const tab = payload.tab;
    const url = '/Board/' + tab;
    delete payload.tab;
    return req<ApiRowsResponse<BoardViewModel[]>>('get', url, payload);
  },
  // 刪除公告欄
  apiDeleteData(payload: number[]) {
    return req<ApiResponse<BoardViewModel[]>>('delete', '/Board', payload);
  },
  // 設定封面檔案
  apiSetCover(payload: { id: number; path: string }) {
    const { id, path } = payload;
    return req<ApiResponse<number>>(
      'patch',
      `/Board/${id}/frontcover?path=${path}`,
    );
  },
  // 獲取跑馬燈訊息
  apiGetMarquee() {
    return req<ApiResponse<BoardViewModel[]>>('get', '/Board/marquee');
  },
};

export default Board;

export const announcementConfig = [
  {
    label: '主旨',
    name: 'title',
    field: 'title',
    align: 'left',
    formType: 'inputString',
    message: '請選擇 主旨',
    isTable: true,
    isDialogForm: true,
    required: true,
    withLabel: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '主旨', val: 'Title', isDefault: true },
  },
  {
    label: '公告內容',
    name: 'content',
    field: 'content',
    align: 'left',
    formType: 'textArea',
    message: '請輸入 公告內容',
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '公告內容', val: 'Content' },
  },
  {
    label: '公告起始時間',
    name: 'start',
    field: 'start',
    align: 'left',
    formType: 'date',
    message: '請輸入 公告起始時間',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: '公告日期',
    searchType: 'date',
    searchOption: {
      startVal: 'Start',
      endVal: 'End',
      startString: '公告起始時間',
      endString: '公告結束時間',
    },
  },
  {
    label: '公告結束時間',
    name: 'end',
    field: (row: BoardViewModel) => (row.end !== '9999-12-31' ? row.end : ''),
    func: (row: string) => (row !== '9999-12-31' ? row : ''),
    align: 'left',
    formType: 'date',
    message: '請輸入 公告結束時間',
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: '是否置頂',
    name: 'top',
    field: 'top',
    func: (row: BoardViewModel) => (row ? '是' : '否'),
    align: 'left',
    formType: 'toggle',
    message: '請輸入 是否置頂',
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: '是否顯示跑馬燈',
    name: 'marqueeEnabled',
    field: 'marqueeEnabled',
    func: (row: BoardViewModel) => (row ? '是' : '否'),
    align: 'left',
    formType: 'toggle',
    message: '請輸入 是否顯示跑馬燈',
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: '跑馬燈訊息',
    name: 'marquee',
    field: 'marquee',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 跑馬燈訊息',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '身分(可複選)',
    name: 'boardNotifies',
    field: 'boardNotifies',
    func: (row: BoardNotifyViewModel[]) =>
      row
        .map(
          (boardNotify: BoardNotifyViewModel) => boardNotify.role.description,
        )
        .join('、'),
    align: 'left',
    formType: 'selectMany',
    message: '請輸入 身分',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '類別',
    name: 'type',
    field: 'type',
    func: (row: BoardViewModel) => BoardTypesChangeToCh(row),
    align: 'left',
    formType: 'checkboxMany',
    message: '請輸入 分類',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
