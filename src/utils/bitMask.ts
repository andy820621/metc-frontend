import { Ref } from "vue";
export interface flagOption {
  label: string;
  value: number;
}

// 將 number[] 轉換成 BitMask (位掩碼)
export function numberToBitMask(arr: number[]): number {
  return arr.reduce((acc, currentVal) => acc + currentVal, 0);
}

// 將 flag 陣列轉換成 BitMask (位掩碼)
export function flagsToMask<T extends flagOption>(flags: T[]): number {
  let mask = 0;
  for (const flag of flags) {
    mask |= flag.value;
  }
  return mask;
}

// 將 BitMask (位掩碼) 轉換成 number[] 並且更新到 model 上
export function maskToNumberArrayAndUpdateToModel(
  maskNumber: number,
  model: Ref<number[]>,
  options: flagOption[]
) {
  model.value = [];
  const flagNumberArray = options.map((item) => item.value);
  flagNumberArray.forEach((num) => {
    const result = maskNumber & num;
    if (result === num) model.value.push(num);
  });
}

// 將 BitMask (位掩碼) 轉換成 flag 陣列
export function maskToFlags<T extends flagOption>(
  mask: number,
  options: T[],
  cb?: (option: T) => void
): T[] {
  const selectedOptions: T[] = [];
  for (const option of options) {
    if ((mask & option.value) !== 0) {
      selectedOptions.push(option); // 把 value 有在 mask 的 option 放入
      if (cb) cb(option); // 或是客制方法直接更動 options
    }
  }
  return selectedOptions; // 回傳 value 有在 mask 的 option[]
}

// 將 BitMask (位掩碼) 轉換成 中文陣列
export function maskToChineseArray<T extends flagOption>(
  mask: number,
  options: T[]
): string[] {
  const chineseArray: string[] = [];
  for (const option of options) {
    if ((mask & option.value) !== 0) {
      chineseArray.push(option.label); // 把中文 label 放入
    }
  }
  return chineseArray;
}
