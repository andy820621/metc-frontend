import { ApiResponse } from "./api.type";
import { req } from "boot/axios";
interface MqttUserProperty {
  name?: string;
  value?: string;
}
interface MqttClientPublishResult {
  isSuccess: boolean;
  packetIdentifier?: number;
  reasonCode: number; // enum MqttClientPublishReasonCodeinteger [ 0, 16, 128, 131, 135, 144, 145, 151, 153 ]
  reasonString?: string;
  userProperties: MqttUserProperty[];
}

const deviceControl = {
  // 設備控制命令發布 // fatek
  apiDeviceControl(gateway: number, deviceId: number, controlArr: number[]) {
    return req<ApiResponse<MqttClientPublishResult[]>>(
      "post",
      `/Client/${deviceId}/control?gateway=${gateway}`,
      controlArr
    );
  },
  // 設備的電源控制命令發布
  apiPowerControl(deviceId: number, controlArr: number[]) {
    return req("post", `/Client/${deviceId}/power`, controlArr);
  },
  // 讀取展場控制點位
  apiGetPresentControl() {
    return req("get", "/Client");
  },
  // 展場控制命令發布
  apiPostPresent(deviceId: number, number: number, gateway = 0,) {
    return req("post", `/Client/${deviceId}/present?gateway=${gateway}&number=${number}`);
  },

};

export default deviceControl;
