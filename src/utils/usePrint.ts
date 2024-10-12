export interface thObjectType {
  [key: string]: string;
}
export interface tdContent {
  [key: keyof thObjectType]: string;
}
/**
 * 將資料陣列進行轉換，將與 tableTitleObject 中的鍵匹配的每個值加上段落標籤。
 * @param data - 資料物件的陣列。
 * @param tableTitleObject - 包含要匹配的鍵的物件。
 * @returns 轉換後的資料陣列。
 */
// 如果全部欄位都是單純文字可用這個方法，不是的話得在外頭寫客製方法
export function getTdContent<T>(data: T[], tableTitleObject: object) {
  return data.map((item) => {
    const transformedItem: { [key: string]: string } = {};
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(tableTitleObject, key)) {
        transformedItem[key] = `<p>${item[key]}</p>`;
      }
    }
    return transformedItem;
  });
}
export function getTable(
  thObject: thObjectType,
  tdContent: tdContent[]
): string {
  console.log("tdContent", tdContent);
  const header = `<tr>
    ${Object.values(thObject)
      .map((item) => {
        return `<th style="padding: 5px; width: 10%">${item}</th>`;
      })
      .join("")}
  </tr>`;
  const body = tdContent
    .map((content) => {
      return `<tr>
    ${Object.keys(thObject)
      .map((key) => {
        return `<td><div>${content[key]}</div></td>`;
      })
      .join("")}
  </tr>`;
    })
    .join("");

  return `<table>${header + body}</table>`;
}
const initialCSS = `
h1 {
  text-align: center;
  margin: 0
  padding: 0
}
h2 {
  margin: 0;
  padding: 15px 0 0 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  page-break-before: avoid;
}
td,
th {
  border: solid 1px #000;
}

td {
  padding: 8px;
  border: solid 1px #000;
  text-align: center;
  height: 1px;
}
td > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}
td > div img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  object-position: center;
  display: block;
  margin: 0 auto;
}
td > div p {
  margin: 0;
  display: grid;
  align-items: center;
}
td > div > * {
  width: 100%;
  height: 100%;
  padding: 0.5rem 0;
  flex: 1 0 0;
}
td > div * ~ * {
  border-top: 1px solid #000 !important;
}
td > div > *:first-child {
  padding-top: 0;
}
td > div > *:last-child {
  padding-bottom: 0;
}
`;
export function print(
  mainContent: string,
  title: string,
  isLandscape = false,
  extraCss = ""
) {
  let css = initialCSS + extraCss;
  if (isLandscape) {
    css += `@page {
      size: landscape;
    }`;
  }
  // 開一個新視窗
  const newWin = window.open("", "列印");
  if (newWin) {
    newWin.document.write("列印");
    newWin.document.open();
    // <h2 style="margin-bottom: 1rem">樓層 : 1F ( 總人數: 7 人 )</h2>
    newWin.document.write(
      `<html>
        <head>
          <title>列印</title>
          <style>
            ${css}
          </style>
        </head>
        <body onload="window.print()">
          <h1 style="font-size: 1.7rem">${title}</h1>
          ${mainContent}
        </body>
      </html>`
    );
    newWin.document.close();
    setTimeout(function () {
      newWin.close();
    }, 15);
  }
}
// 參數參考

// tbObject: {dutyType: '班別模式', className: '班別', position: '職位', photo: '照片', name: '姓名', …}
// tdContent = Array<{
//   cellPhoneNumber: "<p>0958632547</p>",
//   className: "<p>通報班</p>",
//   dutyType: "<p>平日<br>夜間<br>假日</p>",
//   floor: "<p>11F ~ 13F</p>",
//   name: "<p>慧君 (班長)</p>",
//   photo: `<div>
//              <img src="https://randomuser.me/api/portraits/men/38.jpg" alt="image">
//           </div>` (一格裡有多筆資料時可以透過很多個 div 串起來),
//   position: "<p><span style='color:red;'>班長 ✔</span></p>",
// }>;
// title:string (ex: "消防編組清單");
// isLandscape: boolean = false
// extraCss:? string
