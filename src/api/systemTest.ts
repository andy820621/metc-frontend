import { AxiosResponse, AxiosError } from "axios";
import { req } from "boot/axios";

interface InfluxDBPayload {
  url: string;
  token: string;
  org: string;
  bucketName: string; // 例: Nohmi02, Nohmi03, Fatek03
}

interface MessagePayload {
  provider: number; // 簡訊服務提供商
  userName: string; // 帳號
  password: string; // 密碼
  clientId: string; // 客戶簡訊 ID
  dstAddr: string; // 收訊人手機號碼
  destName: string; // 收訊人姓名
  smBody: string; // 簡訊內容
}

interface LinePayload {
  accessToken: string; // channel access token
  to: string; // user id
  text: string; // 訊息
}

interface NotificationPayload {
  token: string;
  title: string;
  body: string;
}

const Test = {
  // 取得 Postgresql 連線字串
  apiGetPostgresqlConnectionString() {
    return req("get", "/Test/postgresql");
  },
  // 測試 Postgresql 連線
  apiTestPostgresqlConnection(connectionString: string) {
    return req("post", `/Test/postgresql?connectionString=${connectionString}`);
  },
  // 取得 MongoDB 連線字串
  apiGetMongoDBConnectionString() {
    return req("get", "/Test/mongodb");
  },
  // 測試 MongoDB 連線
  apiTestMongoDBConnection(connectionString: string) {
    return req("post", `/Test/mongodb?connectionString=${connectionString}`);
  },
  // 取得 InfluxDB 連線物件
  apiGetInfluxDBConnectionObject(gateway: number) {
    return req("get", `/Test/influxdb?gateway=${gateway}`);
  },
  // 測試 InfluxDB 連線
  apiTestInfluxDBConnection(payload: InfluxDBPayload) {
    const { url, token, org, bucketName } = payload;
    return req(
      "post",
      `/Test/influxdb?url=${url}&token=${token}&org=${org}&bucketName=${bucketName}`
    );
  },
  // 取得簡訊設定
  apiGetMessageSetting() {
    return req("get", "/Test/message");
  },
  // 測試簡訊
  apiTestMessage(payload: MessagePayload) {
    const {
      provider,
      userName,
      password,
      clientId,
      dstAddr,
      destName,
      smBody,
    } = payload;
    return req(
      "post",
      `/Test/message?provider=${provider}&userName=${userName}&password=${password}&clientId=${clientId}&dstAddr=${dstAddr}&destName=${destName}&smBody=${smBody}`
    );
  },
  // 取得 LINE 設定
  apiGetLineSetting() {
    return req("get", "/Test/line") as Promise<
      | AxiosResponse<{
          channelAccessToken: string;
          channelSecret: string;
        } | null>
      | Promise<AxiosError<unknown, unknown>>
    >;
  },
  // 測試 Line
  apiTestLine(payload: LinePayload) {
    const { accessToken, to, text } = payload;
    return req(
      "post",
      `/Test/line?accessToken=${accessToken}&to=${to}&text=${text}`
    );
  },
  // 下載推播設定檔案
  apiGetNotificationSettingFile() {
    return req("get", "/Test/notification") as Promise<
      AxiosResponse<string | null> | Promise<AxiosError<unknown, unknown>>
    >;
  },
  // 測試推播
  apiTestNotification(payload: NotificationPayload, fileFormData?: FormData) {
    const { token, title, body } = payload;
    if (fileFormData) {
      return req(
        "uploadPost",
        `/Test/notification?token=${token}&title=${title}&body=${body}`,
        fileFormData
      );
    } else {
      return req(
        "post",
        `/Test/notification?token=${token}&title=${title}&body=${body}`
      );
    }
  },
  // SignalR 測試
  // Emergency Hub 測試
  apiTestEmergencyHub(message: string) {
    return req("post", `/Test/emergency?message=${message}`);
  },
  // Mqtt Hub 測試
  apiTestMqttHub(message: string) {
    return req("post", `/Test/mqtt?message=${message}`);
  },
  // Fire Hub 測試
  apiTestFireHub(message: string) {
    return req("post", `/Test/fire?message=${message}`);
  },
};

export default Test;
