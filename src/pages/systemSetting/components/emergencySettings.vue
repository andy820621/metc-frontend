<template>
  <div v-if="$q.screen.xs || $q.screen.sm">
    <q-tabs v-model="activeTab" active-color="primary" active-bg-color="grey-3">
      <q-tab name="popupPageSettings" label="災時彈出頁面設定" />
      <q-tab name="fireGuideContentSettings" label="圖控導引文字設定" />
    </q-tabs>
    <q-tab-panels
      v-model="activeTab"
      animated
      swipeable
      vertical
      transition-prev="jump-up"
      transition-next="jump-up"
      class="transparent"
    >
      <!-- 災時彈出頁面設定 -->
      <q-tab-panel class="popupPageSettings" name="popupPageSettings">
        <div class="full-width flex justify-end q-mb-lg">
          <q-btn
            style="margin-left: auto"
            label="測試設定結果"
            color="primary"
            @click="openMultipleMonitors"
          />
        </div>

        <q-form @submit="handleSubmit">
          <div
            v-for="(item, index) in formItems"
            :key="index"
            class="q-mb-md group-container"
          >
            <div class="group-title">頁面 {{ index + 1 }}</div>
            <div class="input-group">
              <q-select
                v-model="item.menuName"
                :options="selectOptions"
                label="頁面路徑 (URL)"
                class="q-mr-md"
                emit-value
                map-options
                :hint="`url: ${sideBarPathMaps[item.menuName]}`"
                :rules="[(val) => !!val || '請選擇頁面路徑 (URL)']"
              />
              <q-input
                v-model="item.index"
                label="電腦號碼 (第幾台)"
                type="number"
                @keydown="handleNumberInputKeydown"
                :rules="[
                  (val) =>
                    val === undefined ||
                    val === null ||
                    val === '' ||
                    (Number.isInteger(Number(val)) && val >= 0) ||
                    '必須是大於等於 0 的正整數',
                ]"
              />
              <q-btn color="primary" icon="delete" @click="deleteItem(item)" />
            </div>
          </div>
          <div
            v-for="(item, idx) in newFormItems"
            :key="idx"
            class="q-mb-md group-container"
          >
            <div class="group-title">頁面 {{ formItems.length + idx + 1 }}</div>
            <div class="input-group">
              <q-select
                v-model="item.menuName"
                :options="selectOptions"
                label="頁面路徑 (URL)"
                class="q-mr-md"
                emit-value
                map-options
                :hint="`url: ${sideBarPathMaps[item.menuName]}`"
                :rules="[(val) => !!val || '請選擇頁面路徑 (URL)']"
              />
              <q-input
                v-model="item.index"
                label="電腦號碼 (第幾台)"
                type="number"
                @keydown="handleNumberInputKeydown"
                :rules="[
                  (val) =>
                    val === undefined ||
                    val === null ||
                    val === '' ||
                    (Number.isInteger(Number(val)) && val >= 0) ||
                    '必須是大於等於 0 的正整數',
                ]"
              />
              <q-btn color="primary" icon="delete" @click="deleteItem(item)" />
            </div>
          </div>

          <div class="btn-group">
            <q-btn label="新增一組頁面設定" color="primary" @click="addItem" />
            <q-btn label="送出" color="primary" type="submit" />
          </div>
        </q-form>
      </q-tab-panel>

      <!-- 圖控導引文字設定 -->
      <q-tab-panel name="fireGuideContentSettings">
        <div class="row q-col-gutter-xl" v-if="guideSettingContent.length">
          <div
            class="col-12 col-md-6"
            v-for="(item, index) in guideSettingContent"
            :key="index"
          >
            <q-input dense v-model="item.title" class="q-mb-md" />

            <EditableTextarea
              ref="editableTextarea"
              v-model="item.content"
              :id="String(index + 1)"
              :buttons="guideBtn"
            />

            <div v-if="item.checkList" class="q-mt-md">
              <div class="text-subtitle1 text-bold">確認事項</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    placeholder="確認事項內容"
                    v-for="(list, idx) in item.checkList"
                    :key="idx"
                    v-model="list.label"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-for="(list, idx) in item.checkList"
                    :key="idx"
                    v-model="list.url"
                    placeholder="跳轉頁面連結"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center q-mt-lg">
          <q-btn
            label="儲存"
            color="primary"
            @click="saveGuideData(guideSettingContent)"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <q-card
    flat
    style="background: transparent"
    class="flex-nowrap flex-col q-col-gutter-md full-height"
    v-else
  >
    <q-splitter v-model="splitterModel" class="flex-grow-1 q-pb-md q-pr-md">
      <template v-slot:before>
        <q-tabs
          v-model="activeTab"
          vertical
          active-color="primary"
          active-bg-color="grey-3"
        >
          <q-tab name="popupPageSettings" label="災時彈出頁面設定" />
          <q-tab name="fireGuideContentSettings" label="圖控導引文字設定" />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="activeTab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
          class="transparent"
        >
          <!-- 災時彈出頁面設定 -->
          <q-tab-panel class="popupPageSettings" name="popupPageSettings">
            <div class="full-width flex justify-end q-mb-lg">
              <q-btn
                style="margin-left: auto"
                label="測試設定結果"
                color="primary"
                @click="openMultipleMonitors"
              />
            </div>

            <q-form @submit="handleSubmit">
              <div
                v-for="(item, index) in formItems"
                :key="index"
                class="q-mb-md group-container"
              >
                <div class="group-title">頁面 {{ index + 1 }}</div>
                <div class="input-group">
                  <q-select
                    v-model="item.menuName"
                    :options="selectOptions"
                    label="頁面路徑 (URL)"
                    class="q-mr-md"
                    emit-value
                    map-options
                    :hint="`url: ${sideBarPathMaps[item.menuName]}`"
                    :rules="[(val) => !!val || '請選擇頁面路徑 (URL)']"
                  />
                  <q-input
                    v-model="item.index"
                    label="電腦號碼 (第幾台)"
                    type="number"
                    @keydown="handleNumberInputKeydown"
                    :rules="[
                      (val) =>
                        val === undefined ||
                        val === null ||
                        val === '' ||
                        (Number.isInteger(Number(val)) && val >= 0) ||
                        '必須是大於等於 0 的正整數',
                    ]"
                  />
                  <q-btn
                    color="primary"
                    icon="delete"
                    @click="deleteItem(item)"
                  />
                </div>
              </div>
              <div
                v-for="(item, idx) in newFormItems"
                :key="idx"
                class="q-mb-md group-container"
              >
                <div class="group-title">
                  頁面 {{ formItems.length + idx + 1 }}
                </div>
                <div class="input-group">
                  <q-select
                    v-model="item.menuName"
                    :options="selectOptions"
                    label="頁面路徑 (URL)"
                    class="q-mr-md"
                    emit-value
                    map-options
                    :hint="`url: ${sideBarPathMaps[item.menuName]}`"
                    :rules="[(val) => !!val || '請選擇頁面路徑 (URL)']"
                  />
                  <q-input
                    v-model="item.index"
                    label="電腦號碼 (第幾台)"
                    type="number"
                    @keydown="handleNumberInputKeydown"
                    :rules="[
                      (val) =>
                        val === undefined ||
                        val === null ||
                        val === '' ||
                        (Number.isInteger(Number(val)) && val >= 0) ||
                        '必須是大於等於 0 的正整數',
                    ]"
                  />
                  <q-btn
                    color="primary"
                    icon="delete"
                    @click="deleteItem(item)"
                  />
                </div>
              </div>

              <div class="btn-group">
                <q-btn
                  label="新增一組頁面設定"
                  color="primary"
                  @click="addItem"
                />
                <q-btn label="送出" color="primary" type="submit" />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- 圖控導引文字設定 -->
          <q-tab-panel name="fireGuideContentSettings">
            <div class="row q-col-gutter-xl" v-if="guideSettingContent.length">
              <div
                class="col-12 col-md-6"
                v-for="(item, index) in guideSettingContent"
                :key="index"
              >
                <q-input dense v-model="item.title" class="q-mb-md" />

                <EditableTextarea
                  ref="editableTextarea"
                  v-model="item.content"
                  :id="String(index + 1)"
                  :buttons="guideBtn"
                />

                <div v-if="item.checkList" class="q-mt-md">
                  <div class="text-subtitle1 text-bold">確認事項</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        placeholder="確認事項內容"
                        v-for="(list, idx) in item.checkList"
                        :key="idx"
                        v-model="list.label"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-for="(list, idx) in item.checkList"
                        :key="idx"
                        v-model="list.url"
                        placeholder="跳轉頁面連結"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-center q-mt-lg">
              <q-btn
                label="儲存"
                color="primary"
                @click="saveGuideData(guideSettingContent)"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </q-card>
</template>

<script setup lang="ts">
import Files from "src/api/file";
import Screen, { ScreenViewModel } from "src/api/screen";
import { sideBarTitleMaps, sideBarPathMaps } from "src/router/routes";
import { openMultipleMonitors } from "src/utils/openMultipleMonitors";

// 左側導覽的寬度(%)
const splitterModel = ref(10);
const activeTab = ref("popupPageSettings");

// 災時彈出頁面設定
const formItems = ref<ScreenViewModel[]>([]);
const newFormItems = ref<ScreenViewModel[]>([]);
const selectOptions = ref<{ label: string; value: string }[]>([]);

const formItemsTrueValue = computed(() => {
  return getTrueValue(formItems);
});
const newFormItemsTrueValue = computed(() => {
  return getTrueValue(newFormItems);
});
function getTrueValue(formItems: Ref<ScreenViewModel[]>) {
  return formItems.value.map((item) => ({
    ...(item.id && { id: item.id }),
    menuName: item.menuName,
    index: item.index - 1,
  }));
}

onMounted(async () => {
  // 獲取資料
  const result = await Screen.apiGetData({
    filters: "",
    page: 1,
    rowsPerPage: 0,
  });
  if (result.data) {
    formItems.value = result.data.rows.map((item) => {
      item.index = item.index + 1;
      return item;
    });
  }
  // 獲取下拉
  const menus = await Screen.apiGetScreenMenus();
  if (menus.data) {
    selectOptions.value = menus.data.map((item) => ({
      label: sideBarTitleMaps[item],
      value: item,
    }));
  }

  if (!formItems.value.length) {
    newFormItems.value.push({ menuName: "", index: 1 });
  }
});

function addItem() {
  newFormItems.value.push({ menuName: "", index: 1 });
}
const $q = inject("$q") as typeof QVueGlobals;

async function handleSubmit() {
  if (formItemsTrueValue.value.length) {
    const result = (await Screen.apiPatchData(
      formItemsTrueValue.value
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        message: "編輯成功",
        type: "positive",
        position: "top",
      });
    } else {
      $q.notify({
        message: "編輯失敗",
        type: "negative",
        position: "top",
      });
    }
  }

  if (newFormItemsTrueValue.value.length) {
    const resut = (await Screen.apiPostData(
      newFormItemsTrueValue.value
    )) as typeof AxiosResponse;
    if (resut.data) {
      $q.notify({
        message: "新增成功",
        type: "positive",
        position: "top",
      });
      // 把新增的資料移動到 formItems
      formItems.value.push(...newFormItems.value);
      newFormItems.value.length = 0;
    } else {
      $q.notify({
        message: "新增失敗",
        type: "negative",
        position: "top",
      });
    }
  }
}

function handleNumberInputKeydown(e: KeyboardEvent) {
  const invalidChars = ["-", "+", "e", "E"];
  if (invalidChars.includes(e.key)) e.preventDefault();
}
async function deleteItem(item: ScreenViewModel) {
  if (item.id) {
    const result = (await Screen.apiDeleteData([
      item.id,
    ])) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        message: "刪除成功",
        type: "positive",
        position: "top",
      });
    } else {
      $q.notify({
        message: "刪除失敗",
        type: "negative",
        position: "top",
      });
      return;
    }
  }
  const index = formItems.value.indexOf(item);
  formItems.value.splice(index, 1);
}

// 圖控
const guideBtn = ref([
  {
    label: "大樓名稱",
    trueValue: "{bN}",
  },
  {
    label: "樓層",
    trueValue: "{uofN}",
  },
  {
    label: "時間",
    trueValue: "{rTime}",
  },
  {
    label: "通報人",
    trueValue: "{ac}",
  },
  {
    label: "本帳號",
    trueValue: "{userName}",
  },
  {
    label: "帳號聯絡方式",
    trueValue: "{userPhoneNumber}",
  },
  {
    label: "滅火結果",
    trueValue: "{result}",
  },
]);
interface emergencySettingType {
  ePage: string;
  title: string;
  content: string;
  btn: {
    label: string;
    value: string;
    color: string;
    step: number;
  }[];
  checkList?: {
    label: string;
    url: string;
    value: number;
    status: boolean;
  }[];
}
// 儲存圖控導引文字設定
async function saveGuideData(data: emergencySettingType[]) {
  const hadGuideData = await getFireGuideData();
  console.log("hadGuideData", hadGuideData);
  // 刪除原資料
  if (hadGuideData) {
    (await Files.apiDeleteFile(
      encodeURI("Hidden:\\FireGuide.txt")
    )) as typeof AxiosResponse;
  }

  const jsonStr = JSON.stringify(data);
  const fileContent = new File([jsonStr], "FireGuide.txt", {
    type: "",
  });
  const formData = new FormData();
  const fileName = "FireGuide.txt";
  formData.append("file", fileContent, fileName);
  const result = await Files.apiUploadFile(
    formData,
    encodeURI("Hidden:\\FireGuide.txt")
  );
  if (result) {
    $q.notify({
      type: "positive",
      message: "儲存導引內容成功",
      position: "top",
    });
    getFireGuideData();
  } else {
    $q.notify({
      type: "negative",
      message: "儲存導引內容失敗",
      position: "top",
    });
  }
}

const guideSettingContent = ref<emergencySettingType[]>([
  {
    ePage: "fireCheck",
    title: "疑似火災",
    content:
      "本大樓{uofN}接收到火災訊號 ，已自動通知滅火班前往確認，需立即確認設備狀況及其他班別人員是否就定位。",
    btn: [],
  },
  {
    ePage: "noneFire",
    title: "非火災 / 誤報 - 防災中心二次確認",
    content:
      "本大樓 {uofN} 先前接收到火災訊號 ，經 {ac} 確認為「{result}」，需再確認實際情況。",
    btn: [],
  },
  {
    ePage: "inFire",
    title: "確認火災",
    content:
      "本大樓 {uofN} 於 {rTime} 經 {ac} 確認為「火災」，系統已自動通知各相關人員，請立即撥打「119」報案。",
    btn: [
      {
        label: "聯絡",
        value: "contact",
        color: "white",
        step: 3,
      },
    ],
  },
  {
    ePage: "inFire",
    title: "確認火災",
    content:
      "【119報案內容】這裡是新北市板橋區三民路一段122號 {bN} {uofN} 發生火災。請儘快派人協助。我的連絡電話是 {userPhoneNumber}。",
    btn: [
      {
        label: "已聯絡消防隊",
        value: "contacted",
        color: "white",
        step: 4,
      },
    ],
  },
  {
    ePage: "inFire",
    title: "確認火災",
    content: "立即確認以下事項是否完成：",
    checkList: [
      {
        label: "撥打119",
        url: "",
        value: 0,
        status: false,
      },
      {
        label: "自衛消防編組定位狀況",
        url: "/emergency/sDFMViewer",
        value: 1,
        status: false,
      },
      {
        label: "設備狀況",
        url: "/emergency/emergencyDeviceStatus",
        value: 2,
        status: false,
      },
    ],
    btn: [
      {
        label: "上一步",
        value: "preStep",
        color: "white",
        step: 3,
      },
      {
        label: "完成並結束導引",
        value: "finishGuide",
        color: "white",
        step: 5,
      },
    ],
  },
  {
    ePage: "lift",
    title: "執行自衛消防編組",
    content: "已完成通知各自衛消防編組，需依現場狀況下達指令。",
    btn: [],
  },
  {
    ePage: "fireFailure",
    title: "滅火失敗",
    content:
      "{rTime} 經 {ac} 通知「{result}」</b>， 需確認所有人員 (<a href='/emergency/sDFMViewer' target='_blank'>編組名冊<a> 及 <a href='/emergency/emergencyPplStatus' target='_blank'>人員名冊<a>)是否已完成疏散。",
    btn: [],
  },
  {
    ePage: "noneFire",
    title: "滅火成功",
    content:
      "{rTime} 經 {ac} 通知「{result}」</b>，  需確認以下事項：<br> 1.確認所有人員是否疏散完畢。<br> 2.相關設備是否關閉或啟動。 <br> 3. 是否有人受傷需要救護。<br> 4.回報119現場狀況。",
    btn: [],
  },
  {
    ePage: "lift",
    title: "歷史事件簿列印",
    content: "按下按鈕並將本次事件存為火災歷史事件簿",
    btn: [],
  },
]);
async function getFireGuideData() {
  const result = (await Files.apiFileByPath(
    encodeURI("Hidden:\\FireGuide.txt")
  )) as typeof AxiosResponse;
  if (result.data) {
    const decodedData = atob(result.data);
    const jsonData = new TextDecoder().decode(
      // 將二進制數據轉換成 UTF-8 編碼的字串
      new Uint8Array([...decodedData].map((char) => char.charCodeAt(0)))
    );
    guideSettingContent.value = JSON.parse(jsonData);
  } else {
    $q.notify({
      message: "取得導引資料失敗",
      type: "negative",
      position: "top",
    });
  }

  return !!result.data;
}
onMounted(getFireGuideData);
</script>

<style scoped lang="scss">
.popupPageSettings {
  .group-container {
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
    position: relative;
    transition: background-color 0.4s linear;
    &:hover {
      background-color: hsl(0, 0%, 89%, 81%);
    }
    .group-title {
      font-weight: bold;
      position: absolute;
      top: -10px;
      left: 10px;
      background-color: #eee;
      padding: 0 4px;
      font-size: 1.2rem;
      color: #727272;
    }

    .input-group {
      display: flex;
      justify-content: flex-start;
      gap: 1rem;
      .q-input,
      .q-select {
        width: 47%;
      }
      .q-btn {
        width: 32px;
        height: 32px;
        align-self: flex-end;
        justify-self: end;
        margin-left: auto;
      }
    }
  }

  .btn-group {
    display: flex;
    justify-content: space-between;
  }
}
</style>
