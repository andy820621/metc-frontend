import type { UserViewModel } from "src/api/accountSetting";
import type { DeviceViewModel } from "src/api/device";
import type { ProviderViewModel } from "src/api/supplierData";
import { birthdayFormatAge } from "./formatUtils";
import { deviceStatus } from "./deviceStatus";

export const userConfig = [
  {
    label: "地址",
    name: "roleAddressPlates",
    field: "houseNumber",
    func: (val: UserViewModel["roleAddressPlates"]) =>
      val
        ? val
            .flatMap((p) => p.addressPlates.map((a) => a.houseNumber))
            .filter((value, index, self) => self.indexOf(value) === index)
            .join("\n")
        : "",
    align: "left",
    formType: "selectString",
  },
  {
    label: "姓名",
    name: "fullname",
    field: "fullname",
    align: "left",
    formType: "inputString",
  },
  {
    label: "性別",
    name: "sex",
    field: "sex",
    func: (val: UserViewModel["sex"]) =>
      val !== null ? (val ? "女" : "男") : "尚未設定",
    align: "left",
    formType: "radioOption",
  },
  {
    label: "身分證",
    name: "identityCard",
    field: "identityCard",
    align: "left",
    formType: "inputString",
  },
  {
    label: "生日",
    name: "birthday",
    field: "birthday",
    align: "left",
    formType: "date",
  },
  {
    label: "年齡",
    name: "birthday",
    field: "age",
    func: (val: UserViewModel["birthday"]) =>
      val ? birthdayFormatAge(val) : "尚未填寫",
    align: "left",
    formType: "inputString",
  },
  {
    label: "電話",
    name: "contactNumber",
    field: "phone",
    align: "left",
    formType: "phone",
  },
  {
    label: "email",
    name: "email",
    field: "email",
    align: "left",
    formType: "email",
  },
  {
    label: "手機",
    name: "phoneNumber",
    field: "phoneNumber",
    align: "left",
    formType: "cellPhone",
  },
  {
    label: "其他連絡電話",
    name: "phoneNumber2",
    field: (row: UserViewModel) =>
      row.phoneNumber2 && row.phoneNumber2.length
        ? row.phoneNumber2.join("、")
        : "",
    func: (val: UserViewModel["phoneNumber2"]) =>
      val && val.length ? val.join("\n") : "",
    align: "left",
    formType: "cellPhone",
  },
  {
    label: "緊急聯絡人",
    name: "emergencyContact",
    field: "emergencyContact",
    align: "left",
    formType: "inputString",
  },
  {
    label: "緊急電話",
    name: "emergencyNumber",
    field: "emergencyNumber",
    align: "left",
    formType: "phone",
  },
  {
    label: "其他緊急電話",
    name: "emergencyNumber2",
    field: (row: UserViewModel) =>
      row.emergencyNumber2 && row.emergencyNumber2.length
        ? row.emergencyNumber2.join("、")
        : "",
    func: (val: UserViewModel["emergencyNumber2"]) =>
      val && val.length ? val.join("\n") : "",
    align: "left",
    formType: "cellPhone",
  },
  {
    label: "備註",
    name: "note",
    field: "note",
    align: "left",
    formType: "textArea",
  },
];

export const deviceListConfig = [
  {
    label: "維護廠商",
    name: "maintainVendor",
    field: (row: { maintainVendor: ProviderViewModel }) =>
      row.maintainVendor?.name,
    align: "left",
    formType: "inputString",
    message: "請輸入 維護廠商",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "設備名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 設備名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "設備狀況",
    name: "condition",
    field: (row: DeviceViewModel) => deviceStatus(row.condition),
    align: "left",
    formType: "inputString",
    message: "請輸入 設備狀況",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "上次保養時間",
    name: "LastMaintainTime",
    field: (row: DeviceViewModel) => row.lastMaintain?.completionDate,
    align: "left",
    formType: "date",
    message: "請選擇 上次保養時間",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "備註",
    name: "note",
    field: "note",
    align: "left",
    formType: "textArea",
    message: "請輸入 備註",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
