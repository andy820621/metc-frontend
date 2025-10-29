import type { tempDataType } from "./tableMixin";

export function phoneRules(val: string) {
  if (!val) return true; // 如果值為空，不進行驗證
  if (val[0] !== "0") return "首碼必須為0";
  if (val.startsWith("02")) return val.length === 10 || "台北市電話需輸入10碼";
  return val.length === 9 || "至少需輸入9碼";
}
export const phoneRulesMask = computed(() => (tempData: tempDataType) => {
  if (tempData.contactNumber || tempData.chargeNumber) {
    const [idx0, idx1, idx2, idx3] =
    tempData.contactNumber || tempData.chargeNumber || [];
    if (idx1 === "2") {
      return "(##)-####-####";
    } else if (idx1 === "8" && (idx2 === "2" || idx2 === "3") && idx3 === "6") {
      return "(####)-#-####";
    } else if (
      (idx1 === "3" && idx2 === "7") ||
      (idx1 === "8" && (idx2 === "9" || idx2 === "2"))
    ) {
      return "(###)-##-####";
    } else if (idx1 === "4" && idx2 === "9") {
      // 南投
      return "(###)-###-####";
    }
    return "(##)-###-####";
  }
});

export function mobilePhoneRules(val: string) {
  if (!val) return true; // 如果值為空，不進行驗證
  if (!val.match(/^09\d{8}$/)) {
    return "台灣行動電話號碼應以 09 開頭，後接 8 位數字";
  }
  return true;
}
