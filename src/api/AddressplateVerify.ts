import { req } from 'boot/axios';
import type { ApiResponse, pagination } from './api.type';
import { userConfig } from 'src/utils/linkUrlConfig';
import type { UserViewModel } from './accountSetting';
import type { AddressPlateViewModel } from './addressPlate';
import type { RoleViewModel } from 'src/api/role';
import Role, { roleType } from 'src/api/role';
import type { tableConfigItem } from 'src/utils/tableMixin';

export interface UserAddressPlateViewModel {
  id: number;
  user: UserViewModel;
  role: RoleViewModel;
  addressPlate: AddressPlateViewModel;
  addressPlateConfirmed: boolean;
  addressPlateReason: string;
  isHead: boolean;
}

// 獲取系統角色下拉
async function setRoleOptions() {
  const result = await Role.apiGetRoles([
    { type: roleType.role, isEmergency: null },
    { type: roleType.class, isEmergency: null },
  ]);
  const options = result.data.map((item) => {
    if (item.name === 'Manager') item.description = '防火管理人';
    return {
      label: item.description,
      value: item.id,
    };
  });
  for (const item of addressPlatesVerifyConfig) {
    if (item.name === 'role' && item.searchOption) {
      item.searchOption.options = options;
      break;
    }
  }
}
void setRoleOptions();

// 地址驗證 config
export const addressPlatesVerifyConfig: tableConfigItem[] = [
  {
    label: '驗證結果',
    name: 'addressPlateConfirmed',
    field: 'addressPlateConfirmed',
    align: 'left',
    formType: 'boolean',
    message: '請選擇 驗證狀況',
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: 'onlyOpen',
    isTableSlot: true,
  },
  {
    label: '用戶',
    name: 'user',
    field: 'user',
    align: 'left',
    formType: 'selectString',
    message: '請選擇 用戶',
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: 'onlyOpen',
    config: userConfig,
    // 進階搜尋用
    searchTitle: '搜尋範圍',
    searchType: 'string',
    searchOption: { label: '用戶', val: 'UserName', isDefault: true },
  },
  {
    label: '角色/身分',
    name: 'role',
    field: (row: UserAddressPlateViewModel) => row.role.description,
    align: 'left',
    formType: 'selectMany',
    message: '請選擇 角色/身分',
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: 'onlyOpen',
    // 進階搜尋用 (Equals 下拉)
    searchTitle: '角色身分',
    searchType: 'singleSelect',
    searchOption: {
      val: 'RoleId',
      // options: roleOptions, // 這個值透過 setRoleOptions 設定
      style: 'padding: 0 .2rem 0 .6rem',
    },
  },
  {
    label: '樓層/地址',
    name: 'addressPlate',
    field: (row: UserAddressPlateViewModel) => row.addressPlate.houseNumber,
    align: 'left',
    formType: 'selectString',
    message: '請選擇 樓層/地址',
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '樓層/地址', val: 'AddressPlateHouseNumber' },
  },
  {
    label: '驗證失敗原因',
    name: 'addressPlateReason',
    field: 'addressPlateReason',
    align: 'left',
    formType: 'inputString',
    message: '請選擇 驗證失敗原因',
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: 'onlyOpen',
    // 進階搜尋用
    searchType: 'string',
    searchOption: { label: '驗證失敗原因', val: 'AddressPlateReason1' },
  },
];
const AddressplateValidate = {
  // 取得地址驗證
  apiGetData(payload: pagination & { buildingId: number }) {
    return req('get', '/validate/addressplate', payload);
  },
  apiPatchSuccess(payload: number[]) {
    return req('patch', '/validate/addressplate/success', payload);
  },
  apiPatchFailure(id: number, reason: string) {
    return req(
      'patch',
      `/validate/addressplate/failure?id=${id}&reason=${reason}`,
    );
  },
  // 該使用者是否為該地址戶長
  apiUserIsHead(addressplateId: number) {
    return req<ApiResponse<boolean>>(
      'post',
      `/validate/ishead?id=${addressplateId}`,
    );
  },
};

export default AddressplateValidate;
