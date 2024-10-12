<template>
  <div class="row q-col-gutter-md q-py-md justify-between items-center">
    <div class="flex justify-start q-mb-md" style="gap: 1rem">
      <q-btn
        :icon="matCreateNewFolder"
        type="submit"
        @click.prevent="handleOpenCreateFolderDialog"
      >
        <q-tooltip
          class="text-body2"
          transition-show="scale"
          transition-hide="scale"
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
        >
          新增資料夾
        </q-tooltip></q-btn
      >
      <q-btn
        :icon="mdiCloudUpload"
        type="submit"
        @click="
          () => {
            dialogVisible = true;
            dialogValue = 'fileUpload';
          }
        "
      >
        <q-tooltip
          class="text-body2"
          transition-show="scale"
          transition-hide="scale"
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
        >
          檔案上傳
        </q-tooltip></q-btn
      >
      <q-btn icon="delete" type="submit" @click="handleDelete">
        <q-tooltip
          class="text-body2"
          transition-show="scale"
          transition-hide="scale"
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
        >
          多筆刪除
        </q-tooltip></q-btn
      >
    </div>

    <q-form @submit.prevent="searchText = searchInputValue">
      <q-input
        dense
        debounce="1000"
        v-model="searchInputValue"
        placeholder="請輸入關鍵字"
      >
        <template v-slot:append>
          <q-icon
            name="search"
            class="cursor-pointer"
            type="submit"
            @click="searchText = searchInputValue"
          />
        </template>
      </q-input>
    </q-form>
  </div>

  <div class="row q-col-gutter-md">
    <div
      class="col-xs-12 col-sm-12 col-md-12"
      :class="{ 'q-pl-none': $q.screen.xs || $q.screen.sm }"
    >
      <q-scroll-area
        class="q-mb-none"
        :visible="false"
        :style="`height: ${scrollAreaHeight}`"
      >
        <div
          class="text-subtitle1 text-bold fz-20"
          :style="{
            'padding-left': !$q.screen.xs && !$q.screen.sm ? '84px' : '',
          }"
        >
          <q-breadcrumbs
            class="q-mb-md cursor-pointer text-primary"
            active-color="grey-6"
            separator-color="black"
          >
            <template v-slot:separator>
              <q-icon size="1.5em" name="chevron_right" color="primary" />
            </template>
            <q-breadcrumbs-el
              :label="root.name"
              icon="home"
              @click="handleBreadcrumbs(null)"
            />
            <q-breadcrumbs-el
              :label="item"
              icon="folder"
              v-for="(item, index) in pathArray"
              :key="item"
              @click="handleBreadcrumbs(index)"
            />
          </q-breadcrumbs>
        </div>

        <q-separator class="q-my-sm" />

        <div
          v-if="!resultFolderData.length && !resultFileData.length"
          class="text-grey fz-18"
          :style="{
            'padding-left': !$q.screen.xs && !$q.screen.sm ? '84px' : '',
          }"
        >
          尚未有檔案或資料夾
        </div>
        <!-- 資料夾 -->
        <q-list v-if="resultFolderData.length" dense class="q-px-none q-pr-xs">
          <q-item
            tag="label"
            v-ripple
            v-for="item in resultFolderData"
            :key="item.name"
            @click.stop="openFolder(item.name)"
          >
            <div
              class="flex justify-between items-center full-width"
              :style="{
                'padding-left':
                  !$q.screen.xs && !$q.screen.sm ? '72px' : '62px',
              }"
            >
              <div>
                <q-icon
                  :name="mdiFolderOpen"
                  class="cursor-pointer q-mr-md"
                  style="font-size: 24px"
                />
                <span
                  class="text-bold fz-18"
                  :style="{ color: item.activeColor || 'inherit' }"
                >
                  {{ item.name }}
                </span>
              </div>

              <div>
                <q-btn
                  dense
                  icon="delete"
                  class="q-ml-md"
                  @click.stop="deleteFolder(item.name)"
                >
                  <q-tooltip
                    class="text-body2"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[10, 10]"
                  >
                    刪除資料夾
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-item>
        </q-list>
        <!-- 檔案 -->
        <q-list v-if="resultFileData.length" dense class="q-px-none q-pr-xs">
          <q-item
            tag="label"
            v-ripple
            v-for="(item, index) in resultFileData"
            :key="item.name"
          >
            <q-item-section>
              <q-checkbox
                v-model="fileModelArray"
                :val="item.name"
                class="full-width"
              >
                <template v-slot>
                  <div class="flex full-width justify-between items-center">
                    <span
                      :class="
                        $q.screen.xs || $q.screen.sm ? 'q-mr-xs' : 'q-mr-md'
                      "
                    >
                      {{ index + 1 }}.
                    </span>

                    <span
                      :style="{
                        color: item.activeColor || 'inherit',
                        maxWidth:
                          $q.screen.xs || $q.screen.sm ? '100px' : 'initial',
                      }"
                      class="fz-18"
                    >
                      {{ item.name }}
                    </span>

                    <q-space />
                    <q-btn
                      dense
                      :icon="matPhoto"
                      padding="5px 5px"
                      @click="handlePreviewFile(item.name)"
                    >
                      <q-tooltip
                        class="text-body2"
                        transition-show="scale"
                        transition-hide="scale"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                      >
                        預覽圖片
                      </q-tooltip>
                    </q-btn>

                    <q-btn
                      dense
                      :icon="matSettings"
                      class="q-ml-md"
                      @click="settingFileData(item)"
                    >
                      <q-tooltip
                        class="text-body2"
                        transition-show="scale"
                        transition-hide="scale"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                      >
                        設定資料
                      </q-tooltip>
                    </q-btn>

                    <q-btn
                      dense
                      icon="delete"
                      class="q-ml-md"
                      @click="deleteFile([item.name])"
                    >
                      <q-tooltip
                        class="text-body2"
                        transition-show="scale"
                        transition-hide="scale"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                      >
                        刪除檔案
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-checkbox>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
  </div>

  <q-dialog v-model="dialogVisible">
    <q-card
      :style="$q.platform.is.mobile ? 'width:85%' : 'min-width: 450px'"
      class="q-pa-md"
      v-if="dialogValue === 'createFolderModel'"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold">
          新增資料夾
        </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section class="row items-center q-pb-lg" style="gap: 1rem">
        <q-input
          ref="folderNameRef"
          class="col-grow"
          v-model="folderName"
          placeholder="自行輸入資料夾名稱"
          lazy-rules
          :rules="[(val: any) => !!val]"
        >
          <template v-slot:error> 請輸入資料夾名稱 </template>
        </q-input>
      </q-card-section>
      <q-card-section align="center" class="q-gutter-md">
        <q-btn
          outline
          color="primary"
          label="確定新增"
          @click.prevent="addNewFolder"
        />
        <q-btn outline color="primary" label="取消" v-close-popup />
      </q-card-section>
    </q-card>
    <q-card
      :style="$q.platform.is.mobile ? 'width:85%' : 'min-width: 450px'"
      class="q-pa-md"
      v-else-if="dialogValue === 'fileUpload'"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold"> 檔案上傳 </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section class="row items-center q-pb-lg" style="gap: 1rem">
        <q-uploader
          ref="uploaderRef"
          :factory="(uploaderFactoryFn as QUploaderProps['factory'])"
          label="檔案上傳"
          color="primary"
          text-color="white"
          multiple
          class="full-width"
        >
          <template v-slot:list="scope">
            <q-list separator>
              <q-item
                v-for="file in scope.files"
                :key="file.__key"
                class="items-center"
              >
                <q-item-section>
                  <q-item-label class="full-width ellipsis">
                    {{ file.name }}
                  </q-item-label>

                  <q-item-label caption>
                    Status: {{ file.__status }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                  </q-item-label>
                </q-item-section>

                <q-item-section v-if="file.__img" thumbnail class="gt-xs">
                  <img :src="file.__img.src" style="object-fit: cover" />
                </q-item-section>

                <q-item-section top side>
                  <q-btn
                    class="gt-xs"
                    size="12px"
                    flat
                    dense
                    round
                    icon="delete"
                    @click="scope.removeFile(file)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-uploader>
      </q-card-section>
    </q-card>
    <q-card
      :style="$q.platform.is.mobile ? 'width:85%' : 'min-width: 450px'"
      class="q-pa-md"
      v-if="dialogValue === 'settingData'"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold"> 設定資料 </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section class="row q-pb-lg text-body2" style="font-size: 16px">
        將此筆資料<span class="text-negative"
          >「{{ currentFileData.name }}」</span
        >設定為
      </q-card-section>
      <q-card-section class="q-gutter-md q-pt-none" align="center">
        <slot
          name="btn"
          :fullPath="fullPath"
          :fileModelArray="fileModelArray"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <DialogFilePreview
    v-model="previewFileModel"
    :image-url="imageUrl"
    :iframeUrl="iframeUrl"
    :downloadUrl="downloadUrl"
  />
</template>

<script setup lang="ts">
// icon
import { mdiFolderOpen, mdiCloudUpload } from "@quasar/extras/mdi-v6";
import {
  matPhoto,
  matCreateNewFolder,
  matSettings,
} from "@quasar/extras/material-icons";
// api
import File from "src/api/file";
import { AxiosPromise } from "axios";
// quasar
import { QUploaderProps } from "quasar";
// utils
import fileRead, {
  extractFilenameAndExtension,
  showInIframe,
  excelFileTypes,
  wordFileTypes,
} from "src/utils/fileRead";
// vueUse
import { onKeyUp } from "@vueuse/core";

const slots = useSlots();
const $q = inject("$q") as typeof QVueGlobals;
const { getFile, file, useObjectUrl } = fileRead();

const props = withDefaults(
  defineProps<{
    containerHeight: number;
    root: { path: string; name: string };
    highlightObj?: { [path: string]: string };
  }>(),
  {
    containerHeight: 0,
  }
);

const highlightObj = computed(() => props.highlightObj);

const rootPath = ref(); // 跟目錄路徑
// 資料夾路徑
const pathArray = reactive<string[]>([
  // "資料夾1", "資料夾2"
]);
watch(pathArray, initData);
// 根目錄路徑 + 資料夾路徑
const fullPath = computed(() => {
  if (!rootPath.value) return "";

  if (pathArray.length) {
    return rootPath.value + pathArray.join("\\") + "\\";
  }

  return rootPath.value;
});

async function getFileData(path: string | null = null) {
  const encodedPath = path
    ? encodeURI(path)
    : pathArray.length
    ? encodeURI(fullPath.value)
    : encodeURI(rootPath.value);
  const result = (await File.apiGetFileList(
    encodedPath
  )) as typeof AxiosResponse;
  console.log("now fileData", result);
  if (result.data) {
    fileData.value = result.data;
  } else {
    $q.notify({
      type: "negative",
      message: "獲取檔案列表失敗",
      position: "top",
    });
  }
}
async function getFolderData(path: string | null = null) {
  const encodedPath = path
    ? encodeURI(path)
    : pathArray.length
    ? encodeURI(fullPath.value)
    : encodeURI(rootPath.value);

  const result = (await File.apiGetFolderList(
    encodedPath
  )) as typeof AxiosResponse;
  console.log("now folderData", result);
  if (result.data) {
    folderData.value = result.data;
  } else {
    $q.notify({
      type: "negative",
      message: "獲取資料夾列表失敗",
      position: "top",
    });
  }
}

// 資料夾
const folderData = ref<string[]>([]);
const formattedFolderListData = computed(() => {
  return folderData.value.map((item) => {
    const spiltItem = item.split("\\");
    const name = spiltItem[spiltItem.length - 2];
    if (highlightObj.value && highlightObj.value[item]) {
      return { name, activeColor: highlightObj.value[item] };
    }
    return { name };
  });
});
const resultFolderData = computed(() => {
  if (searchText.value) {
    return formattedFolderListData.value.filter((item) => {
      return item.name.includes(searchText.value);
    });
  }
  return formattedFolderListData.value;
});
async function deleteFolder(name: string) {
  $q.dialog({
    title: "提示",
    message: `確定要刪除名稱為【${name}】的資料夾嗎?`,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    // 刪除資料夾
    const encodedPath = encodeURI(fullPath.value + name + "\\");
    const result = (await File.apiDeleteFolder(
      encodedPath
    )) as typeof AxiosResponse;
    if (result.data) {
      getFolderData();
      $q.notify({
        type: "positive",
        message: "刪除資料夾成功",
        position: "top",
      });
    } else {
      $q.notify({
        type: "negative",
        message: "刪除資料夾失敗",
        position: "top",
      });
    }
  });
}
function openFolder(name: string) {
  console.log("openFolder invoked!", name);
  pathArray.push(name);
}
// 檔案
const fileModelArray = ref([]);
const uploaderRef = ref();
const fileData = ref<string[]>([]);
const formattedFileList = computed(() => {
  return fileData.value.map((item) => {
    const spiltItem = item.split("\\");
    const name = spiltItem[spiltItem.length - 1];
    if (highlightObj.value && highlightObj.value[item]) {
      return { name, activeColor: highlightObj.value[item] };
    }
    return { name };
  });
});
const resultFileData = computed(() => {
  if (searchText.value) {
    return formattedFileList.value.filter((item) => {
      return item.name.includes(searchText.value);
    });
  }
  return formattedFileList.value;
});
const previewFileModel = ref(false);
const imageUrl = ref("");
const iframeUrl = ref("");
const downloadUrl = ref("");
onKeyUp("Delete", handleDelete);
async function deleteFile(names: string[]) {
  $q.dialog({
    title: "提示",
    message: `確定要刪除名稱為【${names.join("、")}】的檔案嗎?`,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  })
    .onOk(async () => {
      // 刪除檔案
      for (const name of names) {
        const encodedPath = encodeURI(fullPath.value + name);
        const result = (await File.apiDeleteFile(
          encodedPath
        )) as typeof AxiosResponse;
        if (result.data) {
          $q.notify({
            type: "positive",
            message: `刪除檔案【${name}】成功`,
            position: "top",
          });
        } else {
          $q.notify({
            type: "negative",
            message: `刪除檔案【${name}】失敗`,
            position: "top",
          });
        }
      }
      getFileData();
    })
    .onCancel(() => {
      fileModelArray.value = [];
    });
}

watch(previewFileModel, (val) => {
  if (!val) {
    imageUrl.value = "";
    iframeUrl.value = "";
    downloadUrl.value = "";
  }
});
async function handlePreviewFile(name: string) {
  const { filename, extension } = extractFilenameAndExtension(name);
  const fileUrl = await getFile(
    fullPath.value + name,
    null,
    extension,
    filename
  );

  console.log("handlePreviewFile fileUrl", fileUrl);

  if (fileUrl) {
    if (showInIframe.includes(extension)) iframeUrl.value = fileUrl;
    else imageUrl.value = fileUrl;

    if (
      excelFileTypes.includes(extension) ||
      wordFileTypes.includes(extension)
    ) {
      const url = useObjectUrl(file).value;
      if (url) downloadUrl.value = url;
    }

    previewFileModel.value = true;
  } else {
    $q.notify({
      type: "negative",
      message: "獲取檔案失敗",
      position: "top",
    });
  }
}
// 設定檔案
const dialogVisible = ref(false);
const dialogValue = ref("");
watch(dialogValue, (val) => {
  if (val === "createFolderModel") {
    setTimeout(() => {
      folderNameRef.value.focus();
    }, 0);
  }
});
watch([dialogVisible, previewFileModel], (val) => {
  if (!val[0] || !val[1]) {
    fileModelArray.value = [];
  }
});

const currentFileData = ref();
function settingFileData(fileData: { name: string; activeColor?: string }) {
  currentFileData.value = fileData;
  dialogVisible.value = true;
  dialogValue.value = "settingData";
  console.log("settingFileData", fileData);
}
// 上傳檔案
function uploaderFactoryFn(files: File[]) {
  return new Promise((resolve, reject) => {
    if (!rootPath.value) return;

    const { name } = files[0];
    // 檔案副檔名小寫化
    const dotIndex = name.lastIndexOf(".");
    const baseName = name.substring(0, dotIndex);
    const extension = name.substring(dotIndex).toLowerCase();
    const replaceDotsBaseName = baseName.replace(/\./g, "-"); // 後端不允許多個`.`
    const lowerCaseName = replaceDotsBaseName + extension;

    const formData = new FormData();
    formData.append("file", files[0], lowerCaseName);

    const path = pathArray.length ? fullPath.value : rootPath.value;
    const encodedPath = encodeURI(path + lowerCaseName);
    console.log("encodedPath", encodedPath);

    (File.apiUploadFile(formData, encodedPath) as AxiosPromise)
      .then((res) => {
        if (res.data) {
          getFileData();
          $q.notify({
            type: "positive",
            message: "新增檔案成功",
            position: "top",
          });
          resolve(null);
          dialogVisible.value = false;
        } else {
          const { errors } = res as unknown as {
            errors: { [key: string]: string };
          };
          const errorMsg = Object.values(errors)[0];
          $q.notify({
            type: "negative",
            message: "新增檔案失敗: " + errorMsg,
            position: "top",
          });
          reject(errorMsg);
        }
      })
      .catch((err: Error) => {
        $q.notify({
          type: "negative",
          message: "新增檔案失敗: " + err,
          position: "top",
        });
        reject(err);
      })
      .finally(() => {
        uploaderRef.value.reset();
      });
  });
}

const scrollAreaHeight = computed(() => {
  return props.containerHeight - 32 - 29 - 16 - 56 + "px";
});

// 新增資料夾
const folderName = ref("");
const folderNameRef = ref();

onKeyUp("Enter", () => {
  if (dialogVisible.value && dialogValue.value === "createFolderModel") {
    addNewFolder();
  }
});

function handleOpenCreateFolderDialog() {
  if (pathArray.length >= 2) {
    $q.notify({
      type: "warning",
      message: "資料夾不能超過2層",
      position: "top",
    });
    return;
  }
  dialogValue.value = "createFolderModel";
  dialogVisible.value = true;
}
async function addNewFolder() {
  if (!rootPath.value) return;
  if (!folderName.value) {
    $q.notify({
      type: "warning",
      message: "請輸入資料夾名稱",
      position: "top",
    });
    return;
  } else if (folderName.value.includes(".")) {
    $q.notify({
      type: "warning",
      message: "資料夾名稱不可包含`.`",
      position: "top",
    });
    return;
  }

  const encodedPath = encodeURI(fullPath.value + folderName.value + "\\");
  const result = (await File.apiCreateFolder(
    encodedPath
  )) as typeof AxiosResponse;

  if (result.data) {
    folderName.value = "";
    dialogVisible.value = false;
    getFolderData(); // 獲取資料更新頁面
    $q.notify({
      type: "positive",
      message: "新增資料夾成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "新增資料夾失敗",
      position: "top",
    });
  }
}

// 共用方法
const searchInputValue = ref("");
const searchText = ref("");

// 檔案刪除
function handleDelete() {
  if (fileModelArray.value.length) {
    deleteFile(fileModelArray.value);
  } else {
    $q.notify({
      type: "negative",
      message: "請勾選要刪除的資料列",
      position: "top",
    });
  }
}
watch(
  () => props.root.path,
  (val) => {
    if (val && val !== "") {
      rootPath.value = val;

      initData();
    }
  },
  { immediate: true }
);
function initData() {
  fileModelArray.value.length = 0;
  folderName.value = "";
  folderData.value.length = 0;
  fileData.value.length = 0;
  searchInputValue.value = "";
  searchText.value = "";

  getFileData();
  getFolderData();
}

// 資料夾切換
function handleBreadcrumbs(index: number | null = null) {
  console.log("handleBreadcrumbs index", index);
  if (index !== null) {
    pathArray.splice(index + 1);
  } else {
    // 回到根目錄
    pathArray.length = 0;
  }
}
</script>

<style scoped lang="scss">
.q-focus-helper {
  pointer-events: none !important;
  &::before,
  &::after {
    pointer-events: none !important;
  }
}

.q-list--dense > .q-item,
.q-item--dense {
  padding: 8px 0;
}
</style>
