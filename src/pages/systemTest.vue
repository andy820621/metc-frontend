<template>
  <div class="q-pa-md">
    <q-card>
      <q-tabs
        v-model="activeBlockTab.value"
        :class="
          $q.screen.xs || $q.screen.sm ? 'twoTabsPerRow' : 'mainTabsDesign'
        "
        :active-class="
          $q.screen.xs || $q.screen.sm ? undefined : 'mainTabsActiveClass'
        "
        active-color="activeTab"
        indicator-color="activeTab"
        :active-bg-color="$q.screen.xs || $q.screen.sm ? undefined : 'white'"
        content-class="bg-grey-1"
        align="justify"
        narrow-indicator
        outside-arrows
        inline-label
      >
        <q-tab
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
          :label="tab.label"
          :icon="
            tab.value === activeBlockTab.value &&
            !($q.screen.xs || $q.screen.sm)
              ? mdiCheckCircle
              : undefined
          "
          @click="tabChange(tab)"
        />
      </q-tabs>

      <q-separator />
      <q-tab-panels
        v-model="activeBlockTab.value"
        class="full-height"
        animated
        :swipeable="false"
      >
        <q-tab-panel
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
        >
          <!-- 資料庫 -->
          <template v-if="activeBlockTab.value === 'Database'">
            <div class="grid" style="gap: 1rem">
              <!-- PostgreSQL -->
              <q-card class="q-pa-md">
                <q-toolbar>
                  <q-toolbar-title>PostgreSQL</q-toolbar-title>
                </q-toolbar>
                <q-card-section class="inputContainer">
                  <q-input v-model="postgreSQLInput" label="ConnectionString" />
                  <q-btn @click.prevent="handleCheckPostgreSQL">檢查</q-btn>
                  <!-- 檢查結果 -->
                  <q-icon
                    v-if="postgreSQLTestResult"
                    name="check"
                    color="green"
                    size="lg"
                  />
                  <q-icon
                    v-if="postgreSQLTestResult === false"
                    name="close"
                    color="red"
                    size="lg"
                  />
                </q-card-section>
              </q-card>

              <!-- MongoDB -->
              <q-card class="q-pa-md">
                <q-toolbar>
                  <q-toolbar-title>MongoDB</q-toolbar-title>
                </q-toolbar>
                <q-card-section class="inputContainer">
                  <q-input v-model="mongoDBInput" label="ConnectionString" />
                  <q-btn @click.prevent="handleCheckMongoDB">檢查</q-btn>
                  <!-- 檢查結果 -->
                  <q-icon
                    v-if="mongoDBTestResult"
                    name="check"
                    color="green"
                    size="lg"
                  />
                  <q-icon
                    v-if="mongoDBTestResult === false"
                    name="close"
                    color="red"
                    size="lg"
                  />
                </q-card-section>
              </q-card>

              <!-- InfluxDB -->
              <q-card class="q-pa-md">
                <q-toolbar>
                  <q-toolbar-title>InfluxDB</q-toolbar-title>
                </q-toolbar>
                <q-card-section class="inputContainer">
                  <q-select
                    style="min-width: 300px"
                    v-model="influxDBSelect"
                    :options="influxDBSelectOptions"
                    label="請選擇閘道器序號"
                    @update:model-value="handleInfluxDBSelect($event)"
                  />
                  <q-input v-model="influxDBBucketName" label="BucketName" />
                  <q-btn @click.prevent="handleCheckInfluxDB">檢查</q-btn>
                  <!-- 檢查結果 -->
                  <q-icon
                    v-if="influxDBTestResult"
                    name="check"
                    color="green"
                    size="lg"
                  />
                  <q-icon
                    v-if="influxDBTestResult === false"
                    name="close"
                    color="red"
                    size="lg"
                  />
                </q-card-section>
              </q-card>
            </div>
          </template>
          <!-- 網路 -->
          <template v-if="activeBlockTab.value === 'Internet'">
            <div class="inputContainer">
              <div>
                <q-input autogrow v-model="internetInput" label="測試用 URL" />
                <q-btn @click.prevent="handleCheckInternet">送出</q-btn>
              </div>
            </div>
          </template>
          <!-- 通知、訊息 -->
          <template v-if="activeBlockTab.value === 'Notification'">
            <q-splitter
              v-model="splitterModel"
              unit="px"
              class="fit q-pb-md q-pr-md"
            >
              <template v-slot:before>
                <q-tabs
                  v-model="activeNotifyTab.value"
                  vertical
                  active-color="primary"
                  active-bg-color="grey-4"
                >
                  <q-tab
                    v-for="tab in notificationTabs"
                    :key="tab.value"
                    :name="tab.value"
                    :label="tab.label"
                  />
                </q-tabs>
              </template>

              <template v-slot:after>
                <q-tab-panels
                  v-model="activeNotifyTab.value"
                  animated
                  :swipeable="false"
                  vertical
                  transition-prev="jump-up"
                  transition-next="jump-up"
                  class="transparent"
                >
                  <q-tab-panel name="SignalR" class="signalRPanel">
                    <!-- Emergency 緊急通知 -->
                    <q-card class="q-pa-md">
                      <q-toolbar>
                        <q-toolbar-title
                          >emergencyHub 緊急通知傳送</q-toolbar-title
                        >
                      </q-toolbar>
                      <q-card-section>
                        <q-input v-model="emergencyMessage" label="訊息" />
                      </q-card-section>
                      <q-card-section class="flex">
                        <q-btn @click="submitEmergencyMessage">
                          API 送出
                        </q-btn>

                        <q-space />

                        <q-btn color="primary" @click="invokeEmergencyMethod">
                          invoke SignalR 方法
                        </q-btn>
                      </q-card-section>

                      <!-- 接收 -->
                      <q-card-section
                        v-if="receivedEmergencyMessage.length"
                        class="q-mt-lg"
                        style="border-top: dashed 1px rgb(184, 184, 184)"
                      >
                        <q-toolbar>
                          <q-toolbar-title class="text-subtitle1 text-bold">
                            接收的訊息
                          </q-toolbar-title>
                        </q-toolbar>
                        <q-item
                          dense
                          v-for="(message, i) in receivedEmergencyMessage"
                          :key="i"
                        >
                          <q-item-section class="bg-grey-2">
                            {{ i + 1 }}. {{ message }}
                          </q-item-section>
                        </q-item>
                      </q-card-section>
                    </q-card>

                    <!-- mqttHub 設備訊息頻道 -->
                    <q-card class="q-pa-md">
                      <q-toolbar>
                        <q-toolbar-title>mqttHub 設備訊息頻道</q-toolbar-title>
                      </q-toolbar>
                      <q-card-section>
                        <q-input v-model="mqttMessage" label="訊息" />
                      </q-card-section>
                      <q-card-section class="flex">
                        <q-btn @click="submitMqttMessage"> API 送出 </q-btn>

                        <q-space />

                        <q-btn color="primary" @click="invokeMqttMethod">
                          invoke SignalR 方法
                        </q-btn>
                      </q-card-section>

                      <!-- 接收 -->
                      <q-card-section
                        v-if="receivedMqttMessage.length"
                        class="q-mt-lg"
                        style="border-top: dashed 1px rgb(184, 184, 184)"
                      >
                        <q-toolbar>
                          <q-toolbar-title class="text-subtitle1 text-bold">
                            接收的訊息
                          </q-toolbar-title>
                        </q-toolbar>
                        <q-item
                          dense
                          v-for="(message, i) in receivedMqttMessage"
                          :key="i"
                        >
                          <q-item-section class="bg-grey-2">
                            {{ i + 1 }}. {{ message }}
                          </q-item-section>
                        </q-item>
                      </q-card-section>
                    </q-card>

                    <!-- FireHub 人員統計頻道 -->
                    <q-card class="q-pa-md">
                      <q-toolbar>
                        <q-toolbar-title>FireHub 人員統計頻道</q-toolbar-title>
                      </q-toolbar>
                      <q-card-section>
                        <q-input v-model="fireHubMessage" label="訊息" />
                      </q-card-section>
                      <q-card-section class="flex">
                        <q-btn @click="submitFireHubMessage"> API 送出 </q-btn>

                        <q-space />

                        <q-btn color="primary" @click="invokeFireHubMethod">
                          invoke SignalR 方法
                        </q-btn>
                      </q-card-section>

                      <!-- 接收 -->
                      <q-card-section
                        v-if="receivedFireHubMessage.length"
                        class="q-mt-lg"
                        style="border-top: dashed 1px rgb(184, 184, 184)"
                      >
                        <q-toolbar>
                          <q-toolbar-title class="text-subtitle1 text-bold">
                            接收的訊息
                          </q-toolbar-title>
                        </q-toolbar>
                        <q-item
                          dense
                          v-for="(message, i) in receivedFireHubMessage"
                          :key="i"
                        >
                          <q-item-section class="bg-grey-2">
                            {{ i + 1 }}. {{ message }}
                          </q-item-section>
                        </q-item>
                      </q-card-section>
                    </q-card>
                  </q-tab-panel>

                  <!-- Firebase 推播 -->
                  <q-tab-panel name="FCM">
                    <div class="flex align-center" style="gap: 1rem">
                      <q-file
                        label="載入檔案"
                        label-color="primary"
                        v-model="fileModel"
                        :icon="mdiFileUpload"
                        filled
                        counter
                        :counter-label="counterLabelFunc"
                        use-chips
                        accept=".txt"
                        max-file-size="500000"
                        @update:model-value="updateFile"
                        @rejected="handelReject"
                        class="q-pa-none"
                      >
                        <template #prepend>
                          <q-icon :name="mdiFileUpload" color="primary" />
                        </template>
                      </q-file>
                      <q-btn
                        color="primary"
                        @click="downloadNotificationSettingFile"
                        label="下載推播設定檔案"
                      />
                    </div>
                    <div class="fcmInputBox q-mt-md">
                      <q-input v-model="fcmToken" autogrow label="token" />
                      <q-input v-model="fcmTitle" label="標題" />
                      <q-input v-model="fcmContent" autogrow label="內容" />
                    </div>
                    <div class="flex">
                      <q-space />
                      <q-btn color="primary" @click="testFCM"> 測試推播 </q-btn>
                      <!-- 檢查結果 -->
                      <q-icon
                        v-if="fcmResult"
                        name="check"
                        color="green"
                        size="lg"
                      />
                      <q-icon
                        v-if="fcmResult === false"
                        name="close"
                        color="red"
                        size="lg"
                      />
                    </div>
                    <q-card
                      v-if="fileContent && fileContent.length"
                      class="q-mt-xl"
                    >
                      <q-card-section>
                        <pre
                          style="white-space: pre-wrap; word-wrap: break-word"
                          >{{ fileContent }}
                        </pre>
                      </q-card-section>
                    </q-card>
                  </q-tab-panel>

                  <q-tab-panel name="Line" class="panelWithInputBox">
                    <div class="inputBox">
                      <q-input v-model="lineToken" label="lineToken" />
                      <!-- <q-input
                        readonly
                        v-model="lineSecret"
                        label="lineSecret"
                      /> -->
                      <q-input v-model="lineAcceptUserId" label="傳送對象 ID" />
                      <q-input v-model="lineSubmitMessage" label="訊息" />
                    </div>

                    <div class="btnBox">
                      <q-btn color="primary" @click.prevent="handleTestLine"
                        >測試 Line 推播</q-btn
                      >
                      <!-- 檢查結果 -->
                      <q-icon
                        v-if="lineTestResult"
                        name="check"
                        color="green"
                        size="lg"
                      />
                      <q-icon
                        v-if="lineTestResult === false"
                        name="close"
                        color="red"
                        size="lg"
                      />
                    </div>
                  </q-tab-panel>

                  <q-tab-panel name="TextMessage" class="panelWithInputBox">
                    <div class="inputBox">
                      <q-input
                        type="number"
                        v-model="textMessageProvider"
                        label="簡訊服務提供商"
                      />
                      <q-input v-model="textMessageUserName" label="帳號" />
                      <q-input v-model="textMessagePassword" label="密碼" />
                      <q-input
                        v-model="textMessageClientId"
                        label="客戶簡訊 ID"
                      />
                      <q-input
                        v-model="textMessageDstAddr"
                        label="收訊人之手機號碼"
                      />
                      <q-input
                        v-model="textMessageDestName"
                        label="收訊人名稱"
                      />
                      <q-input v-model="textMessageSmBody" label="簡訊內容" />
                    </div>

                    <div class="btnBox">
                      <q-btn color="primary" @click.prevent="handleTextMessage"
                        >測試簡訊</q-btn
                      >
                      <!-- 檢查結果 -->
                      <q-icon
                        v-if="messageTestResult"
                        name="check"
                        color="green"
                        size="lg"
                      />
                      <q-icon
                        v-if="messageTestResult === false"
                        name="close"
                        color="red"
                        size="lg"
                      />
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </template>
            </q-splitter>
          </template>
          <!-- 伺服器 -->
          <template v-if="activeBlockTab.value === 'Server'"></template>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from "vue";
// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { useSignalRStore } from "src/stores/signalR"; // websocket signalR
import systemTest from "src/api/systemTest";
// icon
import { mdiCheckCircle, mdiFileUpload } from "@quasar/extras/mdi-v6";
// type
import type { QRejectedEntry } from "quasar";
// FCM
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const signalRStore = useSignalRStore();
const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

// tab
const activeBlockTab = ref({
  label: "資料庫",
  value: "Database",
});
const blockTabs = [
  {
    label: "資料庫",
    value: "Database",
  },
  {
    label: "網路",
    value: "Internet",
  },
  {
    label: "通知、訊息",
    value: "Notification",
  },
  {
    label: "伺服器",
    value: "Server",
  },
];

// Block TabPanel Design
// 資料庫
// PostgreSQL
onMounted(async () => {
  const result =
    (await systemTest.apiGetPostgresqlConnectionString()) as typeof AxiosResponse;
  if (result.data) {
    postgreSQLInput.value = result.data;
  }
});
const postgreSQLInput = ref();
const postgreSQLTestResult = ref<boolean | null>(null);
async function handleCheckPostgreSQL() {
  const result = (await systemTest.apiTestPostgresqlConnection(
    postgreSQLInput.value
  )) as typeof AxiosResponse;
  if (result.data || result.data === false) {
    postgreSQLTestResult.value = result.data;
  }
}
// MongoDB
const mongoDBInput = ref();
const mongoDBTestResult = ref<boolean | null>(null);
onMounted(async () => {
  const result =
    (await systemTest.apiGetMongoDBConnectionString()) as typeof AxiosResponse;
  if (result.data) {
    mongoDBInput.value = result.data;
  }
});
async function handleCheckMongoDB() {
  const result = (await systemTest.apiTestMongoDBConnection(
    mongoDBInput.value
  )) as typeof AxiosResponse;
  if (result.data || result.data === false) {
    mongoDBTestResult.value = result.data;
  }
}
// InfluxDB
const influxDBSelect = ref(0);
const influxDBSelectOptions = ref([0]);
const influxDBData = ref();
const influxDBBucketName = ref("");
const influxDBTestResult = ref<boolean | null>(null);
onMounted(async () => {
  influxDBSelect.value = influxDBSelectOptions.value[0];
  handleInfluxDBSelect(influxDBSelect.value);
  influxDBBucketName.value = "Nohmi03";
});
async function handleInfluxDBSelect(gateway: number) {
  const result = (await systemTest.apiGetInfluxDBConnectionObject(
    gateway
  )) as typeof AxiosResponse;
  console.log("now handleInfluxDBSelect's result", result);
  if (result.data) {
    influxDBData.value = result.data;
  }
}
async function handleCheckInfluxDB() {
  if (!influxDBData.value) {
    $q.notify({
      type: "warning",
      message: "請先開啟 gateway 或是獲取正確的 InfluxDB 資訊",
      position: "top",
    });
    return;
  }
  const { url, token, org } = influxDBData.value;
  const payload = { url, token, org, bucketName: influxDBBucketName.value };
  const result = (await systemTest.apiTestInfluxDBConnection(
    payload
  )) as typeof AxiosResponse;
  if (result.data || result.data === false) {
    influxDBTestResult.value = result.data;
  }
}

// 網路
const internetInput = ref();
function handleCheckInternet() {
  console.log("handleCheckInternet");
}

// 通知、訊息
const splitterModel = ref(200);
const activeNotifyTab = ref({
  label: "SignalR 推播",
  value: "SignalR",
});
const notificationTabs = [
  {
    label: "SignalR 推播",
    value: "SignalR",
  },
  {
    label: "FCM 推播",
    value: "FCM",
  },
  {
    label: "Line 推播",
    value: "Line",
  },
  {
    label: "簡訊傳送",
    value: "TextMessage",
  },
];

function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);

  if (activeBlockTab.value.value !== tab.value) {
    activeBlockTab.value.value = tab.value;
  }
  activeBlockTab.value.label = tab.label;
}

// signalR
// emergencyHub
const emergencyMessage = ref("");
const receivedEmergencyMessage = ref<string[]>([]);
signalRStore.emergencyHub.connection?.on("Receive", (message: string) => {
  receivedEmergencyMessage.value.push(message);
});
async function submitEmergencyMessage() {
  if (emergencyMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  const result = (await systemTest.apiTestEmergencyHub(
    emergencyMessage.value
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "訊息發送成功",
      position: "top",
    });
  }
}
async function invokeEmergencyMethod() {
  if (emergencyMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  signalRStore.emergencyHub.connection?.invoke(
    "Notify",
    emergencyMessage.value
  );
}
// mqttHub
const mqttMessage = ref("");
const receivedMqttMessage = ref<string[]>([]);
signalRStore.mqttHub.connection?.on("Receive", (message: string) => {
  receivedMqttMessage.value.push(message);
});
async function submitMqttMessage() {
  if (mqttMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  const result = (await systemTest.apiTestMqttHub(
    mqttMessage.value
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "訊息發送成功",
      position: "top",
    });
  }
}
async function invokeMqttMethod() {
  if (mqttMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  signalRStore.mqttHub.connection?.invoke("Notify", mqttMessage.value);
}
// FireHub
const fireHubMessage = ref("");
const receivedFireHubMessage = ref<string[]>([]);
signalRStore.fireHub.connection?.on("Receive", (message: string) => {
  receivedFireHubMessage.value.push(message);
});
async function submitFireHubMessage() {
  if (fireHubMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  const result = (await systemTest.apiTestFireHub(
    fireHubMessage.value
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "訊息發送成功",
      position: "top",
    });
  }
}
async function invokeFireHubMethod() {
  if (fireHubMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  signalRStore.fireHub.connection?.invoke("Notify", fireHubMessage.value);
}

// FCM
const fileContent = ref();
const fileModel = ref();
const fcmToken = ref("");
const fcmTitle = ref("");
const fcmContent = ref("");
const fcmResult = ref<boolean | null>(null);
onMounted(getFirebaseToken);
async function downloadNotificationSettingFile() {
  const result =
    (await systemTest.apiGetNotificationSettingFile()) as typeof AxiosResponse;
  if (result.data) {
    const File = atob(result.data);
    if (File) {
      const blob = new Blob([File], { type: "application/json" });
      const downloadLink = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadLink;
      a.download = "FCM 設定檔案" + ".txt";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } else {
    $q.notify({
      type: "negative",
      message: "無法下載 FEM 設定檔案",
      position: "top",
    });
  }
}
interface counterLabelEvent {
  totalSize: string;
  filesNumber: number;
  maxFiles: string | number;
}
function counterLabelFunc({
  filesNumber,
  maxFiles,
  totalSize,
}: counterLabelEvent): string {
  return filesNumber ? `${filesNumber} 個檔案 (大小: ${totalSize})` : "";
}
const errorMaps = {
  accept: "請上傳 txt 格式的檔案",
  "max-file-size": "檔案大小必須小於 500 kb",
  filter: "...沒用到所以沒有預設內容之後可以自己在這改",
  "max-total-size": "...沒用到所以沒有預設內容之後可以自己在這改",
};
function handelReject(rejectedFiles: QRejectedEntry[]) {
  rejectedFiles.forEach((rejectedFile) => {
    const errorMessage =
      errorMaps[rejectedFile.failedPropValidation as keyof typeof errorMaps];
    if (!errorMessage) return;
    $q.notify({
      message: errorMessage,
      color: "negative",
      icon: "warning",
    });
  });
}
async function updateFile() {
  if (!fileModel.value) return;

  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    const textContent = event.target?.result;
    if (!textContent) return;
    fileContent.value = textContent;
  };
  fileReader.readAsText(fileModel.value);
}

async function testFCM() {
  const payload = {
    token: fcmToken.value,
    title: fcmTitle.value,
    body: fcmContent.value,
  };
  const formData = new FormData();
  if (fileModel.value) {
    formData.append("file", fileModel.value, fileModel.value.name);
    const result = (await systemTest.apiTestNotification(
      payload,
      formData
    )) as typeof AxiosResponse;
    if (result.data || result.data === false) {
      console.log("now result: ", result.data);
      fcmResult.value = result.data;
    }
  } else {
    const result = (await systemTest.apiTestNotification(
      payload
    )) as typeof AxiosResponse;
    if (result.data || result.data === false) {
      console.log("now result: ", result.data);
      fcmResult.value = result.data;
    }
  }
}

async function getFirebaseToken() {
  const firebaseConfig = {
    apiKey: "AIzaSyC3VstjYUdmYUMuqy2xDFeGfv5P3ys01jQ",
    authDomain: "mercuryfire-618cd.firebaseapp.com",
    projectId: "mercuryfire-618cd",
    storageBucket: "mercuryfire-618cd.appspot.com",
    messagingSenderId: "82407845910",
    appId: "1:82407845910:web:5f34186d6d937c6db40537",
    measurementId: "G-W8WVXXWT0G",
  };
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  getToken(messaging, {
    vapidKey:
      "BJxtEotJRDFv9u2Gqe2KtnUpWkZAaCuFsKE3jKw3WZA7x4MEb0ot704YMAUe9Ks0N7TbXaxGcMTsoWlYIQDNBzU",
  })
    .then(async (currentToken) => {
      if (currentToken) {
        fcmToken.value = currentToken;
      } else {
        $q.notify({
          type: "warning",
          message: "未能正確取得 FCM token",
          position: "top",
        });
      }
    })
    .catch((err) => {
      if (err && err.length > 0) {
        $q.notify({
          type: "warning",
          message: "獲取令牌時出現錯誤: " + err,
          position: "top",
        });
      }
      if (Notification.permission !== "granted") {
        // 請求通知權限
        Notification.requestPermission().then(async (permission) => {
          if (permission === "granted") {
            await getFirebaseToken();
          } else if (permission === "denied") {
            $q.notify({
              type: "warning",
              message: "沒有開啟通知權限將無法收取任何推播內容!!",
              position: "top",
            });
          }
        });
      }
    });
}

// Line 推播
const lineToken = ref(""); // channel access token
const lineSecret = ref(""); // channel secret
const lineAcceptUserId = ref("");
const lineSubmitMessage = ref("");
const lineTestResult = ref<boolean | null>(null);
onMounted(async () => {
  const result = (await systemTest.apiGetLineSetting()) as typeof AxiosResponse;
  if (result.data) {
    console.log("now apiGetLineSetting result.data", result.data);
    const { channelAccessToken, channelSecret } = result.data;
    lineToken.value = channelAccessToken;
    lineSecret.value = channelSecret;
  }
});
async function handleTestLine() {
  const payload = {
    accessToken: encodeURIComponent(lineToken.value),
    to: lineAcceptUserId.value,
    text: lineSubmitMessage.value,
  };
  const result = (await systemTest.apiTestLine(
    payload
  )) as typeof AxiosResponse;
  console.log("now result", result);
  if (result.data || result.data === false) {
    lineTestResult.value = result.data;
  }
}

// 簡訊 TextMessage
const textMessageProvider = ref(0);
const textMessageUserName = ref("");
const textMessagePassword = ref("");
const textMessageClientId = ref("");
const textMessageDstAddr = ref("");
const textMessageDestName = ref("");
const textMessageSmBody = ref("");
const messageTestResult = ref<boolean | null>(null);
onMounted(async () => {
  const result =
    (await systemTest.apiGetMessageSetting()) as typeof AxiosResponse;
  if (result.data) {
    const { provider, userName, password } = result.data;
    textMessageProvider.value = provider;
    textMessageUserName.value = userName;
    textMessagePassword.value = password;
  }
});
async function handleTextMessage() {
  const payload = {
    provider: textMessageProvider.value, // 簡訊服務提供商
    userName: textMessageUserName.value, // 帳號
    password: textMessagePassword.value, // 密碼
    clientId: textMessageClientId.value, // 客戶簡訊 ID
    dstAddr: textMessageDstAddr.value, // 收訊人手機號碼
    destName: textMessageDestName.value, // 收訊人姓名
    smBody: textMessageSmBody.value, // 簡訊內容
  };
  const result = (await systemTest.apiTestMessage(
    payload
  )) as typeof AxiosResponse;
  if (result.data || result.data === false) {
    messageTestResult.value = result.data;
  }
}
</script>

<style lang="scss" scoped>
.inputContainer {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 0 0.8rem 0.8rem;
  h5 {
    font-size: 1.2rem;
    padding: 0;
    margin: 0;
  }
  .q-btn {
    margin-top: 8px;
  }
  .q-input {
    min-width: 800px;
  }
}
.signalRPanel,
.fcmInputBox {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.panelWithInputBox {
  .inputBox {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem 2.4rem;
  }
  .btnBox {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
    margin-bottom: -1rem;
  }
}
</style>
