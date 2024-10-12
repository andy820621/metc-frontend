<template>
  <q-drawer
    ref="drawerRef"
    side="right"
    overlay
    behavior="mobile"
    no-swipe-open
    :width="$q.screen.width"
    class="bg-secondary"
  >
    <h3
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 1.2rem 1.6rem"
    >
      提醒事項
    </h3>

    <template v-if="remindListContent.content.length">
      <q-card class="q-mx-lg" style="border-radius: 0.5rem">
        <q-card-section class="listContainer">
          <!-- <q-option-group
          :options="remindList"
          type="checkbox"
          v-model="checkedRemindList"
        /> -->

          <div class="text-bold" style="font-size: 1.3rem">
            {{ remindListContent.title }}
          </div>

          <ul
            v-for="(item, index) in remindListContent.content"
            :key="`item-${index}`"
          >
            <!-- 如果是雙層列表-->
            <li
              v-if="
                typeof item === 'object' && 'title' in item && 'items' in item
              "
              class="text-bold"
              style="font-size: 1.1rem"
            >
              {{ item.title }}

              <ul>
                <li
                  v-for="(subItem, subIndex) in item.items"
                  :key="`subItem-${subIndex}`"
                  style="font-weight: normal; font-size: 1.04rem"
                >
                  {{ subItem }}
                </li>
              </ul>
            </li>

            <!-- 如果是單層列表 -->
            <li v-else class="text-bold" style="font-size: 1.1rem">
              {{ item }}
            </li>
          </ul>
        </q-card-section>
      </q-card>

      <div class="flex justify-center q-mt-md">
        <q-btn color="primary" @click="remindListVisible = false">確定</q-btn>
      </div>
    </template>
    <template v-else>無相關提醒事項</template>
  </q-drawer>
</template>

<script setup lang="ts">
// pinia store
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { useSignalRStore } from "src/stores/signalR";
// api
import System, { SystemViewModel, systemType } from "src/api/system";

const remindListVisible = inject("remindListVisible") as Ref<boolean>;
const $q = inject("$q") as typeof QVueGlobals;

const remindList = ref([]);
const checkedRemindList = ref([]);
async function getRemindData() {
  const result = (await System.apiGetSystemItem(
    systemType.Reminder
  )) as typeof AxiosResponse;

  remindList.value = result.data.map((item: SystemViewModel) => {
    return {
      label: item.label,
      value: item.id,
    };
  });
}
onMounted(getRemindData);

const userStore = useUserStore();
const {
  isGuide,
  isProtection,
  isAmbulance,
  isFire,
  isInfo,
  isManager,
  isNormalUser,
} = storeToRefs(userStore);
const signalRStore = useSignalRStore();
const { processRunning } = storeToRefs(signalRStore);

const drawerRef = ref();

// 提醒事項內容
const remindListContent = computed(() => {
  if (isFire.value) {
    return {
      title: "滅火班火災處理流程",
      content: [
        {
          title: "初期滅火之時機",
          items: [
            "火勢尚未延燒至天花板之前，使用滅火器、水桶等設備滅火。",
            "在未產生閃燃之前，使用室內消防栓滅火。",
          ],
        },
        {
          title: "初期滅火要領",
          items: [
            "【拉】開安全插梢。",
            "握住皮管前端，【瞄】向火源底部。",
            "【壓】握把，噴出滅火劑。",
            "向火源底部左右移動【掃】射。",
            "熄滅後灑水將餘燼冷卻。",
            "保持監控確定熄滅。",
          ],
        },
      ],
    };
  } else if (isGuide.value) {
    return {
      title: "避難引導班火災處理流程",
      content: [
        "傳達避難訊息。",
        "確認緊急出口開啟。",
        "移除避難障礙物品。",
        "確認及通報需要協助避難人員數、位置等資訊。",
        "劃定警戒區。",
        "操作避難器具。",
        "協助避難引導。",
      ],
    };
  } else if (isAmbulance.value) {
    return {
      title: "救護班火災處理流程",
      content: [
        "針對傷員狀況進行止血、外傷包紮、心外按摩等緊急處置。",
        "紀錄傷員基本資料、受傷狀況。",
      ],
    };
  } else if (isManager.value) {
    return {
      title: "防火管理人火災處理流程",
      content: [
        "設置自衛消防本部。",
        "輔助隊長、副隊長，並向地區隊傳達命令及情報。",
        "確認所有人員是否疏散完畢。",
        "相關設備是否關閉或啟動。",
        "是否有人受傷需要救護。",
        "聯繫119並引導救災。",
        "列印人員名冊、災時編組狀況及設備動作資訊。",
        "向消防隊提供情報，引導至災害現場。",
      ],
    };
  } else if (isProtection.value) {
    return {
      title: "安全防護班火災處理流程",
      content: [
        "立即前往發生地區關閉防火捲門及防火門。",
        "停止用火用電設施之使用。",
        "電梯及電扶梯之緊急處置。",
      ],
    };
  } else if (isInfo.value) {
    return {
      title: "通報班火災處理流程",
      content: [
        "即時通知週遭人員火災發生。",
        "即時以警鈴、廣播通報建築物內人員火災發生。",
        "即時通報119。",
        "聯絡相關人員（瓦斯公司、電力公司、消防機關、警察機關、保全公司、公司主管等）。",
      ],
    };
  } else if (isNormalUser.value) {
    // 住戶
    return {
      title: "住戶火災應對提醒",
      content: [
        "切勿驚慌，依照系統或廣播指示行動",
        "關閉家中瓦斯等有任何可能引燃的設備",
        "確認疏散路線。",
        "如無法避難請立即按下系統「請求協助」。",
      ],
    };
  }

  return {
    title: "",
    content: [],
  };
});
</script>

<style lang="scss" scoped>
// :deep(drawerRef) {
//   .q-drawer {
//     z-index: 2; // 避免蓋到左側 Menu
//   }
//   .q-drawer__backdrop {
//     z-index: 1; // 避免蓋到左側 Menu
//     background-color: transparent !important;
//     pointer-events: none;
//   }
//   .q-drawer {
//     background-color: #fff;
//   }
// }

.listContainer {
  counter-reset: section; /* 在最外層容器上重置計數器 */

  /* 為第一層的 ul 設置樣式 */
  & > ul {
    list-style-type: none;
    padding-left: 0;

    & > li::before {
      counter-increment: section; /* 每個 li 項目增加計數器的值 */
      content: counter(section) ". "; /* 顯示計數器的值和點 */
      padding-right: 5px;
    }

    ul {
      list-style-type: none;
      counter-reset: subsection; /* 設置子計數器 */
      padding-left: 20px;
      /* 為第二層的 ul 設置樣式 */
      & > li::before {
        counter-increment: subsection; /* 每個嵌套 li 項目增加計數器的值 */
        content: "(" counter(subsection) ") "; /* 顯示計數器的值，用括號括起來 */
        padding-right: 5px;
      }
    }
  }
}
</style>
