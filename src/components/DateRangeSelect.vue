<template>
  <q-input
    clearable
    :style="{ minWidth, width }"
    :model-value="formattedDateRange"
    @update:model-value="updateDateModel"
    :rules="dateRangeRules"
    mask="####-##-## 至 ####-##-##"
    placeholder="YYYY-MM-DD 至 YYYY-MM-DD"
    @click="handleClickQdate"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          ref="qDateProxy"
          @hide="qDateProxyIsOpen = false"
          @show="qDateProxyIsOpen = true"
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="dateModel"
            mask="YYYY-MM-DD"
            range
            :locale="myLocale"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="關閉" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { date } from "quasar";

const props = withDefaults(
  defineProps<{
    dateModel: { from: string; to: string } | null;
    minWidth?: string;
    width?: string;
  }>(),
  {
    dateModel: () => ({ from: "", to: "" }), // { from: "2020/07/08", to: "2020/07/17" } or { from: "2020-07-08", to: "2020-07-17" }
    minWidth: "250px",
    width: "auto",
  }
);
const emit = defineEmits(["update:dateModel"]);

const dateModel = useVModel(props, "dateModel", emit);

// 日期範圍選取
const qDateProxy = ref();
// eslint-disable-next-line prefer-const
let qDateProxyIsOpen = false;
function handleClickQdate() {
  if (qDateProxy.value && !qDateProxyIsOpen) {
    qDateProxy.value.show();
  }
}
// QDate 顯示轉換成中文
const myLocale = {
  /* 開始日為星期天 */
  days: ["日", "一", "二", "三", "四", "五", "六"], // 替換為中文的星期文本
  daysShort: ["日", "一", "二", "三", "四", "五", "六"], // 替換為中文的星期縮寫
  months: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ], // 替換為中文的月份文本
  monthsShort: [
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
    "十一",
    "十二",
  ], // 替换为中文的月份縮寫
  firstDayOfWeek: 1, // 選填值: 0-6, (ex: 0代表星期天, 1代表星期一, ...)
  format24h: true,
  pluralDay: "天", // 複數日
};

// 計算屬性，用於格式化顯示日期範圍
const formattedDateRange = computed<string>(() => {
  if (dateModel.value && dateModel.value.from && dateModel.value.to) {
    const from = date.formatDate(dateModel.value.from, "YYYY-MM-DD");
    const to = date.formatDate(dateModel.value.to, "YYYY-MM-DD");
    return `${from} 至 ${to}`;
  }
  return "";
});

// 在 QInput 的 rules 中使用自定義驗證邏輯
const dateRangeRules = [
  (val?: { from: string; to: string }) => {
    if (!val || !val.from || !val.to) return true; // 如果日期範圍未完全輸入，則不進行驗證
    // 使用日期工具比較日期
    const isValidRange = date.getDateDiff(val.to, val.from, "days") >= 0;
    return isValidRange || "日期範圍無效"; // 如果日期範圍無效，則返回錯誤信息
  },
];

function updateDateModel(val: string | number | null) {
  if (typeof val === "string") {
    // 使用正則表達式匹配 "YYYY-MM-DD 至 YYYY-MM-DD" 格式
    const matches = val.match(/(\d{4}-\d{2}-\d{2}) 至 (\d{4}-\d{2}-\d{2})/);
    if (matches && matches.length >= 3) {
      // 如果匹配成功，更新 dateModel 的 from 和 to
      dateModel.value = { from: matches[1], to: matches[2] };
    } else {
      // 如果只匹配到一個日期，更新 dateModel 的 from
      const singleMatch = val.match(/(\d{4}-\d{2}-\d{2})/);
      if (singleMatch) {
        dateModel.value = {
          from: singleMatch[1],
          to: dateModel.value?.to || "",
        };
      }
    }
  } else {
    dateModel.value = { from: "", to: "" };
  }
}
</script>

<style scoped></style>
