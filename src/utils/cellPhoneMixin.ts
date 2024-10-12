import { ref } from "vue";
import type { dialogAttrsType } from "src/utils/tableMixin";
import { tempDataType } from "src/api/api.type";

export default function cellPhoneMixin(dialogAttrs: dialogAttrsType) {
  const cellPhoneArr = ref([""]);
  const emgyCellPhoneArr = ref([""]);

  function addOtherPhone(prop: string) {
    if (prop === "phoneNumber2" && cellPhoneArr.value.length < 3) {
      cellPhoneArr.value.push("");
    } else if (
      prop === "emergencyNumber2" &&
      emgyCellPhoneArr.value.length < 2
    ) {
      emgyCellPhoneArr.value.push("");
    }
      console.log("addOtherPhone", prop, cellPhoneArr.value);
  }

  // 讀出電話號碼
  function readPhoneNumber(tempData:tempDataType) {
    cellPhoneArr.value =
      !tempData.phoneNumber2 ||
      tempData.phoneNumber2?.length === 0
        ? [""]
        : tempData?.phoneNumber2 || "";
    emgyCellPhoneArr.value =
      !tempData.emergencyNumber2 ||
      tempData.emergencyNumber2?.length === 0
        ? [""]
        : dialogAttrs?.tempData.emergencyNumber2 || "";
    if (Array.isArray(cellPhoneArr.value)) {
      cellPhoneArr.value?.forEach((i, index) => {
        if (index > 0) {
          tempData["phoneNumber2" + index] = i;
        } else {
          tempData.phoneNumber2 = i;
        }
      });
    }
    if (Array.isArray(emgyCellPhoneArr.value)) {
      emgyCellPhoneArr.value?.forEach((i, index) => {
        if (index > 0) {
          tempData["emergencyNumber2" + index] = i;
        } else {
          tempData.emergencyNumber2 = i;
        }
      });
    }
  }

  // 組出電話號碼
  function formatPhoneNumber(tempData: tempDataType) {
    cellPhoneArr.value?.forEach((i, index) => {
      cellPhoneArr.value[index] =
        index > 0
          ? tempData["phoneNumber2" + index]
          : tempData.phoneNumber2;
          delete tempData["phoneNumber2" + index]
    });

    emgyCellPhoneArr.value?.forEach((i, index) => {
      emgyCellPhoneArr.value[index] =
        index > 0
          ? tempData["emergencyNumber2" + index]
          : tempData.emergencyNumber2;
    });
    // 篩掉空格
    if (cellPhoneArr.value) {
      cellPhoneArr.value = cellPhoneArr.value.filter(
        (item) => item && item?.trim() !== ""
      );
      tempData.phoneNumber2 = cellPhoneArr.value;
    }
    if (emgyCellPhoneArr.value) {
      emgyCellPhoneArr.value = emgyCellPhoneArr.value.filter(
        (item) => item && item?.trim() !== ""
      );
      tempData.emergencyNumber2 = emgyCellPhoneArr.value;
    }
  }
  return {
    cellPhoneArr,
    emgyCellPhoneArr,
    addOtherPhone,
    readPhoneNumber,
    formatPhoneNumber,
  };
}
