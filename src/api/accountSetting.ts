import type { ApiResponse, ApiRowsResponse, pagination } from './api.type';
import { req } from 'boot/axios';
import { Notify } from 'quasar';
import { useBuildingStore } from 'src/stores/building.js';
import type { RoleViewModel } from './role';
import type { BuildingViewModel } from './building';
import type { AddressPlateViewModel } from './addressPlate';
import { birthdayFormatAge } from 'src/utils/formatUtils';
import type { FloorViewModel } from './floors';

const buildingStore = useBuildingStore();

interface RoleBuilding {
  role: RoleViewModel;
  buildings: BuildingViewModel;
}
interface RoleAddressPlate {
  role: RoleViewModel;
  addressPlates: AddressPlateViewModel[];
}

export interface UserAccount {
  id: any;
  fullname: string;
  email?: string;
  phoneNumber?: string;
  phoneNumber2?: string[];
  identityCard?: string;
  birthday?: Date;
  contactNumber?: string;
  emergencyContact?: string;
  emergencyNumber?: string;
  emergencyNumber2?: string[];
  mugShotFileId?: number;
  note?: string;
  sex?: boolean;
  isDisability?: boolean;
  addressPlates: AddressPlateViewModel[];
}
export interface AccountRequest {
  id: number;
  username: string;
  password: string;
}
export interface UserViewModel {
  id?: string;
  account: string;
  fullname: string;
  password: string | null;
  email?: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  lockout?: boolean;
  roleBuildings: RoleBuilding[];
  roleAddressPlates: RoleAddressPlate[];
  addressPlateConfirmeds: { [key: number]: boolean };
  groupRole?: RoleViewModel;
  groupId?: number;
  roles: RoleViewModel[];
  phoneNumber2?: string[];
  mugShotFileId?: number | null;
  identityCard?: string;
  birthday?: string | null;
  contactNumber?: string | null;
  emergencyContact?: string | null;
  emergencyNumber?: string | null;
  emergencyNumber2?: string[];
  note?: string | null;
  sex?: boolean | null;
  isDisability?: boolean | null;
  switchs: number;
  fromAccountId?: number | null;
  userMugShotUrl?: string; // 前端用
  isCommunityUser?: boolean; // 前端用
  statusConfirmObj?: {
    status: string;
    checkedStatus: any;
    message: string;
    checked: boolean;
  }; // 前端用
}

export interface AddressPlateUserViewModel {
  addressPlate: AddressPlateViewModel;
  users: UserViewModel[];
}

export interface FloorAddressPlateViewModel {
  floor: FloorViewModel;
  addressPlates: AddressPlateUserViewModel[];
}

export const userTableConfig = [
  {
    label: '照片',
    name: 'mugShotFileId',
    field: 'mugShotFileId',
    align: 'left',
    formType: 'mugShotFile',
    message: '',
    isTable: false,
    isDialogForm: false,
    required: true,
  },
  {
    label: '帳號',
    name: 'account',
    field: 'account',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 帳號',
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '帳號', val: 'UserName' },
  },
  {
    label: '姓名',
    name: 'fullname',
    field: 'fullname',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 姓名',
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '姓名', val: 'Fullname', isDefault: true },
  },
  {
    label: '性別',
    name: 'sex',
    field: (row: { sex: boolean }) =>
      row.sex ? '女' : row.sex === false ? '男' : '尚未設定',
    align: 'left',
    formType: 'radioOption',
    message: '請輸入 性別',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: '性別',
    searchType: 'singleSelect',
    searchOption: {
      val: 'Sex',
      options: [
        {
          label: '男',
          value: false,
        },
        {
          label: '女',
          value: true,
        },
      ],
    },
  },
  {
    label: '行動不便者',
    name: 'isDisability',
    field: (row: { isDisability: boolean }) => (row.isDisability ? '是' : '否'),
    align: 'left',
    formType: 'checkbox',
    message: '請選擇是否為行動不便者',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '生日',
    name: 'birthday',
    field: 'birthday',
    align: 'left',
    formType: 'date',
    message: '請輸入 生日',
    isTable: false,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: '生日',
    searchType: 'date',
    searchOption: {
      startVal: 'Birthday',
      endVal: 'Birthday',
      disableFuture: true,
    },
  },
  {
    label: '年齡',
    name: 'age',
    field: (row: { birthday: string }) =>
      row.birthday ? birthdayFormatAge(row.birthday) : '尚未填寫',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 年齡',
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: '密碼',
    name: 'password',
    field: 'password',
    align: 'left',
    formType: 'password',
    message: '請輸入 密碼',
    isTable: false,
    isDialogForm: false,
    required: true,
  },
  {
    label: '角色/身分',
    name: 'roles',
    field: 'roles',
    align: 'left',
    formType: 'selectMany',
    message: '請選擇 角色/身分',
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: '身分證',
    name: 'identityCard',
    field: 'identityCard',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 身分證',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '電話',
    name: 'contactNumber',
    field: 'contactNumber',
    align: 'left',
    formType: 'phone',
    message: '請輸入 電話',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: 'email',
    name: 'email',
    field: 'email',
    align: 'left',
    formType: 'email',
    message: '請輸入 email',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '手機',
    name: 'phoneNumber',
    field: 'phoneNumber',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 手機',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '手機', val: 'PhoneNumber' },
  },
  {
    label: '其他連絡電話',
    name: 'phoneNumber2',
    field: 'phoneNumber2',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 其他連絡電話',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '緊急聯絡人',
    name: 'emergencyContact',
    field: 'emergencyContact',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 緊急聯絡人',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '緊急聯絡人', val: 'EmergencyContact' },
  },
  {
    label: '緊急電話',
    name: 'emergencyNumber',
    field: 'emergencyNumber',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 緊急電話',
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: '其他緊急電話',
    name: 'emergencyNumber2',
    field: 'emergencyNumber2',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 其他緊急電話',
    isTable: false,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '緊急電話', val: 'EmergencyNumber' },
  },
  {
    label: '備註',
    name: 'note',
    field: 'note',
    align: 'left',
    formType: 'textArea',
    message: '請輸入 備註',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '備註', val: 'Note' },
  },
];
export const residentDataConfig = [
  {
    label: '照片',
    name: 'mugShotFileId',
    field: 'mugShotFileId',
    align: 'left',
    formType: 'mugShotFile',
    message: '',
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: '地址',
    name: 'houseNumber',
    field: (row: { addressPlates: AddressPlateViewModel[] }) =>
      row.addressPlates?.length
        ? row.addressPlates.map((item) => item.houseNumber).join('、')
        : '',
    align: 'left',
    formType: 'selectString',
    message: '',
    isTable: true,
    isDialogForm: false,
    required: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '地址', val: 'AddressPlateHouseNumber' },
  },
  {
    label: '姓名',
    name: 'fullname',
    field: 'fullname',
    align: 'left',
    formType: 'fullname',
    message: '請輸入 姓名',
    isTable: true,
    isDialogForm: true,
    required: true,
    isTableSlot: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '姓名', val: 'Fullname', isDefault: true },
  },
  {
    label: '性別',
    name: 'sex',
    field: (row: { sex: boolean }) =>
      row.sex ? '女' : row.sex === false ? '男' : '尚未設定',
    align: 'left',
    formType: 'radioOption',
    message: '請輸入 性別',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: '性別',
    searchType: 'singleSelect',
    searchOption: {
      val: 'Sex',
      options: [
        {
          label: '男',
          value: false,
        },
        {
          label: '女',
          value: true,
        },
      ],
    },
  },
  {
    label: '生日',
    name: 'birthday',
    field: 'birthday',
    align: 'left',
    formType: 'date',
    message: '請輸入 生日',
    isTable: false,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: '生日',
    searchType: 'date',
    searchOption: {
      startVal: 'Birthday',
      endVal: 'Birthday',
      disableFuture: true,
    },
  },
  {
    label: '年齡',
    name: 'age',
    field: (row: { birthday: string }) =>
      row.birthday ? birthdayFormatAge(row.birthday) : '尚未填寫',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 年齡',
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: '角色/身分',
    name: 'roles',
    field: 'roles',
    align: 'left',
    formType: 'selectMany',
    message: '請選擇 角色/身分',
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: '身分證',
    name: 'identityCard',
    field: 'identityCard',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 身分證',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '電話',
    name: 'phone',
    field: 'phone',
    align: 'left',
    formType: 'phone',
    message: '請輸入 電話',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: 'email',
    name: 'email',
    field: 'email',
    align: 'left',
    formType: 'email',
    message: '請輸入 email',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '手機',
    name: 'phoneNumber',
    field: 'phoneNumber',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 手機',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '手機', val: 'PhoneNumber' },
  },
  {
    label: '其他連絡電話',
    name: 'phoneNumber2',
    field: 'phoneNumber2',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 其他連絡電話',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '緊急聯絡人',
    name: 'emergencyContact',
    field: 'emergencyContact',
    align: 'left',
    formType: 'inputString',
    message: '請輸入 緊急聯絡人',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '緊急聯絡人', val: 'EmergencyContact' },
  },
  {
    label: '緊急電話',
    name: 'emergencyNumber',
    field: 'emergencyNumber',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 緊急電話',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '緊急電話', val: 'EmergencyNumber' },
  },
  {
    label: '其他緊急電話',
    name: 'emergencyNumber2',
    field: 'emergencyNumber2',
    align: 'left',
    formType: 'cellPhone',
    message: '請輸入 其他緊急電話',
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: '備註',
    name: 'note',
    field: 'note',
    align: 'left',
    formType: 'textArea',
    message: '請輸入 備註',
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '備註', val: 'Note' },
  },
];
const accountSetting = {
  // 編輯帳號管理
  apiPatchData(payload: UserViewModel) {
    return req('patch', '/User', JSON.parse(JSON.stringify(payload)));
  },
  // 取得帳號管理
  apiGetData(payload: pagination) {
    return req('get', '/User', payload);
  },
  // 新增帳號管理
  apiPostData(payload: UserViewModel) {
    return req('post', '/User', JSON.parse(JSON.stringify(payload)));
  },
  // 刪除帳號管理
  apiDeleteData(payload: { value: string }[]) {
    return req('delete', '/User', payload);
  },
  // 使用者狀態鎖定或啟用
  apiLockoutUser(payload: { [key: string]: boolean }) {
    return req('patch', '/user/lockout', payload);
  },
  // 取得符合角色之使用者(非地址驗證者)
  apiGetUsersByRoleName(roleName: string) {
    return req('post', `/user/buildingbyrole?roleName=${roleName}`);
  },

  // 全棟住戶查詢
  apiGetResidentData(pagination: pagination & { buildingId?: number }) {
    let buildingId;
    const localBid = localStorage.getItem('Bid');
    if (!buildingId && localBid) buildingId = buildingStore.Bid || +localBid;
    if (!buildingId) {
      Notify.create({
        type: 'negative',
        message: '尚未獲得大樓 ID',
        position: 'top',
      });
      return;
    }
    pagination.buildingId = buildingId;
    return req<ApiRowsResponse<UserAccount[]>>(
      'get',
      '/user/members',
      pagination
    );
  },

  // 讀取全棟住戶資料 (列印用)
  apiGetResidentDataByBuilding(buildingId: number) {
    return req<ApiResponse<FloorAddressPlateViewModel[]>>(
      'post',
      `/User/bybuilding?buildingId=${buildingId}`
    );
  },
  // 附屬帳號升級成一般帳號
  apiPatchAccountToUser(payload: AccountRequest[]) {
    return req<ApiResponse<AccountRequest[]>>('patch', '/User/touser', payload);
  },
};

export default accountSetting;
