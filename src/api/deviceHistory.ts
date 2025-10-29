import { req } from "boot/axios";
import type { pagination } from "./api.type";
import type { DeviceAddressViewModel, DeviceViewModel } from "./device";
import { DeviceUses } from "./deviceType";
import { date } from "quasar";
// utils
import { toPercentage } from "src/utils/leveMeterCopute";

export interface TimeSpan {
  start: string;
  end: string;
}
// 前端新增的
export interface FormattedDeviceData {
  dateTime?: string;
  useType?: string;
  buildingName?: string;
  floorName?: string;
  addressName?: string;
  deviceName?: string;
  areaName?: string;
  status?: string;
  deviceType?: string;
}
export interface ReceiveDeviceAddressViewModel extends FormattedDeviceData {
  id: number;
  dateTime: string;
  deviceAddress: DeviceAddressViewModel;
  numberOfPoints: number;
  value?: string | null;
  content?: string | null;
  state?: string | null;
}

const DeviceHistory = {
  // 取得設備初始狀態 topic :哪裡來的設備訊號; count: 幾筆資料
  apiGetDeviceStatus(topic: string, count = 12) {
    // The topic can be one of the following: "gateway/nohmi/02" or "gateway/nohmi/03" or "gateway/fatek/03"
    return req("get", `/Receive?topic=${topic}&count=${count}`);
  },
  // 獲取設備歷史紀錄 (分頁)
  apiGetData(pagination: pagination) {
    return req("get", "/Receive/deviceaddress", pagination);
  },
  // 獲取設備歷史紀錄 (根據開始時間 ~ 結束時間，搜尋分頁)
  apiGetDataByTimeSpan(payload: pagination & TimeSpan) {
    return req("get", "/Receive/deviceaddress/range", payload);
  },
  // 獲取設備歷史紀錄 (當週，搜尋分頁)
  apiGetDataByWeek(payload: pagination) {
    return req("get", "/Receive/deviceaddress/week", payload);
  },
  // 獲取設備歷史紀錄 (當月，搜尋分頁)
  apiGetDataByMonth(payload: pagination) {
    return req("get", "/Receive/deviceaddress/month", payload);
  },
};

export default DeviceHistory;

export function formatedDeviceBlockData(data: ReceiveDeviceAddressViewModel[]) {
  const newData: FormattedDeviceData[] = [];
  data.forEach((record) => {
    const newRecord: FormattedDeviceData = {};
    const { functionCode, master, device, addressPlate } = record.deviceAddress;
    newRecord.dateTime = date.formatDate(
      new Date(record.dateTime),
      "YYYY-MM-DD HH:mm:ss"
    );
    newRecord.useType = DeviceUses[device.deviceType.useType];
    newRecord.buildingName = device.building.name;
    newRecord.addressName = addressPlate?.houseNumber ?? "";
    newRecord.deviceName = device.name;
    newRecord.areaName = device.location ?? "";
    newRecord.deviceType = device.deviceType.name;
    // 根據 topic format content
    const { driver } = (master).deviceType;
    const driverName = `${driver}0${functionCode}`;

    // console.log("driverName", driverName, record);

    if (driverName === "fatek03") {
      newRecord.status = record.value === "False" ? "正常" : "動作";
    } else if (driverName === "nohmi02") {
      if (record.state?.length) {
        newRecord.status = record.content + ` : ${record.state}`;
      }
    } else if (driverName === "nohmi03") {
      newRecord.status = JSON.parse(record.content)[0].Value["動作"];
    } else if (driverName === "amsamotion02") {
      newRecord.status = record.state;
    } else if (driverName.includes("mitsubishi")) {
      if (driverName === "mitsubishi03") {
        // 客製化水位計 % 數
        const { value, deviceAddress } = record;
        if (deviceAddress.device.pool) {
          const { area, high, legal, invalid, total, zero } =
            deviceAddress.device.pool;
          const poolViewModel = { area, high, legal, invalid, total, zero };
          newRecord.status = `${toPercentage(+value, poolViewModel)}%`;
        }
      } else {
        newRecord.status = record.value === "False" ? "正常" : "動作";
      }
    }

    newData.push(newRecord);
  });
  return newData;
}
