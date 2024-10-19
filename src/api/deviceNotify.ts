import { req } from "boot/axios";
import { ApiRowsResponse, ApiResponse } from "src/api/api.type";
import { DeviceViewModel } from "./device";
import { Providers } from "./fireMarshalling";
import { ProviderViewModel } from "./supplierData";
import { CommunityUserViewModel } from "./managementCommittee";

export interface DeviceNotifyGetPayload {
  processed: boolean; // 已處理 / 未處理
  page: number;
  rowsPerPage: number;
}
export interface NotifyResultViewModel {
  id: number;
  dateTime: string;
  deviceNotifyId: number;
  provider: Providers;
  providerNavigation?: ProviderViewModel;
  communityUser?: CommunityUserViewModel;
  message: string;
}
export type alertBtnOptions = {
  all: boolean;
} & (
  | {
      keeperUnit: boolean;
    }
  | {
      maintainVendor: boolean;
    }
  | {
      keeperUnit: boolean;
      maintainVendor: boolean;
    }
);

export interface FormattedNotifyResults {
  [key: string]: NotifyResultViewModel[];
}
export interface DeviceNotifyViewModel {
  dateTime: Date | string;
  receiveDeviceAddressId: number;
  processed: boolean;
  deleted: boolean;
  notify?: string;
  device: DeviceViewModel;
  notifyResults: NotifyResultViewModel[];
  // 前端在使用的
  options?: alertBtnOptions;
  isChecked?: boolean;
  formattedNotifyResults: FormattedNotifyResults;
}

export interface SendNotifyPayloadToProvider {
  id: number; // 異常警示通知 id
  notify: string; // 通知
  providerId: number; // 維修人員
}
export interface SendNotifyPayloadToCommunityUser {
  id: number; // 異常警示通知 id
  notify: string; // 通知
  communityUserId: number; // 管理者
}
export type SendNotifyPayload =
  | SendNotifyPayloadToProvider
  | SendNotifyPayloadToCommunityUser;

const deviceNotify = {
  // 異常時，發送通知
  apiSendNotify(payload: SendNotifyPayload) {
    const { id, notify } = payload;

    const providerId = "providerId" in payload ? payload.providerId : "";
    const communityUserId =
      "communityUserId" in payload ? payload.communityUserId : "";

    return req<ApiResponse<NotifyResultViewModel[]>>(
      "post",
      `/DeviceNotify/processing?providerId=${providerId}&communityUserId=${communityUserId}&id=${id}&notify=${notify}`
    );
  },
  // 把警示通知查詢設成已通知
  apiSetProcessed(id: number) {
    return req<ApiResponse<boolean>>(
      "post",
      `/DeviceNotify/processed?id=${id}`
    );
  },
  // 異常警示通知查詢
  apiGetData(payload: DeviceNotifyGetPayload) {
    return req<ApiRowsResponse<DeviceNotifyViewModel[]>>(
      "get",
      "/DeviceNotify",
      payload
    );
  },
  // 異常警示通知刪除
  apiDeleteData(payload: number[]) {
    return req<ApiResponse<boolean>>("delete", "/DeviceNotify", payload);
  },
};

export default deviceNotify;
