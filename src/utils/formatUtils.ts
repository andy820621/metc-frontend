// utils
import { date } from "quasar";
// type
import type { FloorViewModel } from "src/api/floors";

export function birthdayFormatAge(birthday:string) {
    const nowDate = date.formatDate(Date.now(), "YYYY-MM-DD");
    let age = date.getDateDiff(nowDate, birthday, "years");
    const birthDateObj = new Date(birthday);
    const currentDateObj = new Date();

    const currentMonth = currentDateObj.getMonth() + 1;
    const birthMonth = birthDateObj.getMonth() + 1;
    const currentDay = currentDateObj.getDate();
    const birthDay = birthDateObj.getDate();
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age--;
    }
    return age;
}

export interface formattedFloorOption {
  floorsData: FloorViewModel[];
  floorZindex: number;
  lastObjZindex?: number;
}

export function formatFloorsData(floorOptions: FloorViewModel[]) {
  const result = floorOptions.reduce((acc, floor) => {
    const { sort } = floor;

    // 查找是否已經有相同 sort 值的 floorsObject
    const existingObject = acc.find((obj) => obj.floorZindex === sort * 2);

    // 如果已經存在相同 sort 值的 floorsObject，將該 floor 放入其 floorsData 數組中
    if (existingObject) {
      existingObject.floorsData.unshift(floor);
    } else {
      // 如果不存在相同 sort 值的 floorsObject，則創建一個新的 floorsObject
      const newObject = {
        floorZindex: sort * 2,
        floorsData: [floor],
      };
      acc.push(newObject);
    }

    return acc;
  }, [] as formattedFloorOption[]);

  // 按 floorZindex 由大到小進行排序
  result.sort((a, b) => b.floorZindex - a.floorZindex);

  // 把 z-index 都加到正整數
  if (result.length) {
    const lastObjZindex = Math.abs(result[result.length - 1].floorZindex);
    result.forEach((floor) => {
      floor.floorZindex += lastObjZindex;
      floor.lastObjZindex = lastObjZindex;
    });
  }
  return result;
}

// 比較函數，用於根據 dateTime 進行排序
interface withDateTime {
  dateTime: string;
}
export function compareByDateTime(a: withDateTime, b: withDateTime) {
  const dateTimeA = new Date(a.dateTime).getTime();
  const dateTimeB = new Date(b.dateTime).getTime();

  return dateTimeA - dateTimeB;
}

// excel 時間轉換
export function formatExcelDate(numb: number) {
  const old = numb - 1;
  const t = Math.round((old - Math.floor(old)) * 24 * 60 * 60);
  const time = new Date(1900, 0, old, 0, 0, t);
  return date.formatDate(new Date(time), "YYYY-MM-DD");
}
