<template>
  <q-dialog v-model="dialogAttrs.uploadVisible" persistent>
    <q-card
      class="q-px-md"
      :style="
        $q.screen.xs
          ? 'width:100%'
          : $q.screen.sm
          ? 'min-width: 750px;'
          : 'min-width: 1100px;height:700px'
      "
    >
      <q-toolbar>
        <q-toolbar-title class="text-bold text-center q-pa-md"
          >上傳檔案
        </q-toolbar-title>

        <q-btn dense flat icon="close" v-close-popup></q-btn>
      </q-toolbar>

      <q-card-section>
        <FileUpload
          :containerHeight="700 - 63.5 - 16"
          :root="root"
          :highlightObj="highlightObj"
        >
          <template #btn="{ fullPath, fileModelArray }">
            <slot
              name="btn"
              :fullPath="fullPath"
              :fileModelArray="fileModelArray"
            >
              <q-btn
                v-if="setCoverFunc && $props.isDisable"
                type="submit"
                color="primary"
                text-color="white"
                label="封面"
                @click.prevent="setCover(fullPath, fileModelArray)"
                v-close-popup
              />
            </slot>
          </template>
        </FileUpload>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useCloned } from "@vueuse/core";
import { ApiResponse } from "src/api/api.type";
import type { dialogAttrsType } from "src/utils/tableMixin";

const props = withDefaults(
  defineProps<{
    dialogAttrs: dialogAttrsType;
    rootPathName: string;
    rootNameKey?: string;
    updateBlockData?: () => void;
    setCoverFunc?: (payload: {
      path: string;
      id: number;
    }) => Promise<ApiResponse<number>>;
    isDisable?: boolean;
  }>(),
  {
    isDisable: true,
    rootNameKey: "name",
  }
);
const dialogAttrs = computed(() => {
  const { cloned } = useCloned(props.dialogAttrs);
  return cloned.value;
});
const highlightObj = ref<{ [path: string]: string }>({});

watch(
  () => dialogAttrs.value.tempData,
  (val) => {
    console.log("now dialogAttrs.value.tempData changed!! ", val);

    const { id, frontCoverFilePath } = val;
    root.value.path = props.rootPathName + id + ":\\";
    root.value.name = val[props.rootNameKey];
    if (frontCoverFilePath) {
      highlightObj.value = {
        [frontCoverFilePath]: "red",
      };
    }
  },
  { deep: true }
);

const root = ref({ path: "", name: "Home" });

// 設定封面
const $q = inject("$q") as typeof QVueGlobals;
async function setCover(fullPath: string, fileModelArray: string[]) {
  console.log("setCover", fullPath, fileModelArray);
  if (fileModelArray.length > 1) {
    $q.notify({
      type: "warning",
      message: "請只選擇一個檔案",
      position: "top",
    });
    return;
  } else if (fileModelArray.length === 0) {
    $q.notify({
      type: "warning",
      message: "請選擇一個檔案",
      position: "top",
    });
    return;
  }

  // 判斷是否為圖片檔案
  // const filenameExtension = extractFileExtension(fileModelArray[0]) as string;
  // const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"];
  // if (!imageExtensions.includes(filenameExtension)) {
  //   $q.notify({
  //     type: "warning",
  //     message: "請選擇圖片檔案",
  //     position: "top",
  //   });
  //   return;
  // }

  const encodedPath = encodeURI(fullPath + fileModelArray[0]);
  const nowDataId = dialogAttrs.value.tempData.id;
  console.log("encodedPath", encodedPath);
  console.log("dialogAttrs", dialogAttrs.value.tempData);
  const payload = {
    id: nowDataId,
    path: encodedPath,
  };
  if (!props.setCoverFunc) return;
  const result = (await props.setCoverFunc(payload)) as typeof AxiosResponse;

  if (result.data) {
    if (props.updateBlockData) props.updateBlockData();
    $q.notify({
      type: "positive",
      message: "設定封面成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "設定封面失敗",
      position: "top",
    });
  }
}
// function extractFileExtension(inputStr: string) {
//   // 先進行URL解碼
//   const decodedStr = decodeURIComponent(inputStr);

//   // 使用正規表達式或分割法擷取副檔名
//   const match = decodedStr.match(/\.([0-9a-z]+)$/i);

//   if (match && match[1]) {
//     return match[1];
//   } else {
//     return null; // 或返回其他預設值，例如 "unknown"
//   }
// }
</script>

<style lang="scss">
.q-checkbox__label.q-anchor--skip {
  width: 100%;
}
</style>
