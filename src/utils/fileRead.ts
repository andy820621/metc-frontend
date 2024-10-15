import { useObjectUrl, useCloned } from '@vueuse/core';
import { Notify } from 'quasar';
import { renderAsync } from 'docx-preview';
import { read, utils } from 'xlsx';
import type { WorkSheet } from 'xlsx';

// import { tempDataType } from "./tableMixin";

export const excelFileTypes = ['xls', 'xlsx', 'csv'];
export const wordFileTypes = ['docx', 'doc'];
export const showInIframe = [
  ...excelFileTypes,
  ...wordFileTypes,
  ...[
    'pdf',
    'txt',
    'json',
    'ppt',
    'pptx',
    'html',
    'md',
    'xml',
    'htm',
    'css',
    'scss',
    'sass',
    'js',
    'ts',
    'vue',
    'mp3',
    'mp4',
    'm4a',
    'mpeg',
    'avi',
    'mkv',
    'mov',
    'wmv',
    'wav',
    'ogg',
  ],
];

export default function fileRead() {
  const file = shallowRef<File>();

  // base64 string 轉 File
  function base64toFile(
    base64: string,
    fileName = 'file',
    fileType?: string
  ): File {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // 根據文件類型設定MIME類型
    let type = 'application/octet-stream'; // 默認二進制流
    if (fileType) {
      switch (fileType.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          type = 'image/jpeg';
          break;
        case 'png':
          type = 'image/png';
          break;
        case 'gif':
          type = 'image/gif';
          break;
        case 'webp':
          type = 'image/webp';
          break;
        case 'bmp':
          type = 'image/bmp';
          break;
        case 'txt':
        case 'log':
          type = 'text/plain';
          break;
        case 'pdf':
          type = 'application/pdf';
          break;
        case 'doc':
          type = 'application/msword';
          break;
        case 'docx':
          type =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          type = 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          type =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'ppt':
          type = 'application/vnd.ms-powerpoint';
          break;
        case 'pptx':
          type =
            'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'csv':
          type = 'text/csv';
          break;
        case 'html':
        case 'htm':
          type = 'text/html';
          break;
        case 'xml':
          type = 'text/xml';
          break;
        case 'md':
          type = 'text/markdown';
          break;
        case 'scss':
          type = 'text/x-scss';
          break;
        case 'sass':
          type = 'text/x-sass';
          break;
        case 'css':
          type = 'text/css';
          break;
        case 'js':
          type = 'text/javascript';
          break;
        case 'ts':
          type = 'text/typescript';
          break;
        case 'json':
          type = 'application/json';
          break;
        case 'mp3':
          type = 'audio/mpeg';
          break;
        case 'wav':
          type = 'audio/wav';
          break;
        case 'ogg':
          type = 'audio/ogg';
          break;
        case 'avi':
          type = 'video/x-msvideo';
          break;
        case 'm4a':
          type = 'audio/x-m4a';
          break;
        case 'mp4':
          type = 'video/mp4';
          break;
        case 'mpeg':
          type = 'video/mpeg';
          break;
        case 'wmv':
          type = 'video/x-ms-wmv';
          break;
        case 'mkv':
          type = 'video/x-matroska';
          break;
        default:
          type = 'application/octet-stream';
      }
    }

    const file = new File([byteArray], fileName, { type });

    return file;
  }

  async function getFile(
    filePath: string | null = null,
    fileId: number | null = null,
    type: string | null = null,
    fileName = 'file'
  ) {
    let result: typeof AxiosResponse;

    if (filePath) {
      console.log('getFile filePath:', filePath);
    } else if (fileId) {
      console.log('getFile fileId:', fileId);
    } else {
      return '';
    }
    if (result && result.data) {
      const File = type
        ? base64toFile(result.data, fileName, type)
        : base64toFile(result.data);
      file.value = File;
    } else {
      Notify.create({
        type: 'negative',
        message: '獲取檔案失敗',
        position: 'top',
      });
      return false;
    }

    if (type && wordFileTypes.includes(type)) {
      const tempContainer = document.createElement('div');

      // 添加新的 styleContainer 元素用於樣式
      // const styleContainer = document.createElement("style");
      // styleContainer.innerHTML = `
      //   .docx-continer {
      //     padding: 0 !important;
      //   }
      // `;
      // document.head.appendChild(styleContainer);

      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);

      try {
        // 修改 renderAsync 調用,包括 styleContainer 和選項
        // await renderAsync(file.value, tempContainer, styleContainer, {
        //   className: "docx-continer", // string: 默認和文黨樣式 class 名稱/前贅
        //   inWrapper: true, // boolean: 啟用圍繞文件內容的包裝炫覽器
        //   ignoreWidth: false, // boolean: 禁用頁面的渲染寬度
        //   ignoreHeight: false, // boolean: 禁止渲染頁面高度
        //   ignoreFonts: false, // boolean: 禁用字體渲染
        //   breakPages: true, // boolean: 在分頁浮上啟用分頁
        //   ignoreLastRenderedPageBreak: true, // boolean: 在 lastRenderedPageBreak 元素上禁用分頁
        //   experimental: false, // boolean:啟用實驗性功能 (制表符停止計算)
        //   trimXmlDeclaration: true, // boolean: 如果為true, 解析前會從 xml 文件中移除 xml 聲明
        //   useBase64URL: false, // boolean: 如果為true, 圖片、字體等会會轉為 base 64 URL,否則使用 URL.createObjectURL
        //   useMathMLPolyfill: true, // boolean: 包括用于 chrome、edge 等的 MathML polyfill。
        //   debug: false, // boolean: 啟用额外的日志紀錄
        // })
        await renderAsync(file.value, tempContainer);
      } catch (error) {
        throw new Error('docx 轉換失敗: ' + error);
      }

      const docxWrapper = tempContainer.querySelector(
        '.docx-wrapper'
      ) as HTMLElement;
      if (docxWrapper) {
        // docxWrapper.style.backgroundColor = "#fff";
        docxWrapper.style.padding = '1rem .6rem';
      }

      const sectionDocx = tempContainer.querySelector(
        'section.docx'
      ) as HTMLElement;
      if (sectionDocx) {
        if (sectionDocx) {
          sectionDocx.style.setProperty('width', '100%', 'important');
          sectionDocx.style.setProperty('padding', '1rem', 'important');
          sectionDocx.style.setProperty('min-height', 'auto', 'important');
          sectionDocx.style.marginBottom = '0';
          // sectionDocx.style.boxShadow = "none";
        }
      }

      const htmlContent = tempContainer.innerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      document.body.removeChild(tempContainer);

      if (blobUrl) return blobUrl;
    }

    if (type && excelFileTypes.includes(type)) {
      const worksheets = await readExcelFile(file.value);
      const allSheetsHtml = generateAllSheetsHtml(worksheets);
      // 把產出的 HTML 轉成 blob
      const blob = new Blob([allSheetsHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    }

    // return useObjectUrl(file).value;
    // TODO: 之後要考慮使用 revokeObjectURL 去清除內存，或是考慮繼續使用 vueUse 的 useObjectUrl
    return URL.createObjectURL(file.value);
  }

  return {
    file,
    getFile,
    useObjectUrl,
  };
}

export function extractFilenameAndExtension(fullStr: string) {
  const lastDotIndex = fullStr.lastIndexOf('.');

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { filename: fullStr, extension: '' };
  }

  const filename = fullStr.substring(0, lastDotIndex);
  const extension = fullStr.substring(lastDotIndex + 1);
  return { filename, extension };
}

// 產出 Excel 預覽 html
interface WorksheetObj {
  sheetName: string;
  worksheet: WorkSheet;
}

function readExcelFile(file: File): Promise<WorksheetObj[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer = e.target?.result;
      if (arrayBuffer) {
        const data = new Uint8Array(arrayBuffer as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheets: WorksheetObj[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          worksheets.push({ sheetName, worksheet });
        });
        resolve(worksheets);
      } else reject(new Error('讀取檔案失敗'));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
function generateAllSheetsHtml(worksheets: WorksheetObj[]): string {
  let tabsHtml = '<div class="tabs">';
  let sheetsHtml = '<div class="sheets">';

  worksheets.forEach((ws, index) => {
    const isActive = index === 0; // 第一個標籤和工作表為活動狀態
    const tabClass = isActive ? 'tab active' : 'tab';
    const sheetClass = isActive ? 'sheet active' : 'sheet';

    tabsHtml += `<div class="${tabClass}" onclick="showSheet('sheet-${index}', this)">${ws.sheetName}</div>`;
    const sheetHtml = utils.sheet_to_html(ws.worksheet);
    sheetsHtml += `<div id="sheet-${index}" class="${sheetClass}">${sheetHtml}</div>`;
  });

  tabsHtml += '</div>';
  sheetsHtml += '</div>';

  // CSS樣式
  const style = `
    <style>
      /* 基本表格樣式 */
      table {
        border: 1px solid #ddd;
        border-collapse: collapse;
      }
      td, th {
        white-space: nowrap;
        border: 1px solid #ddd;
        padding: 8px 16px;
      }
      .sheet {
        display: none;
      }
      .sheet.active {
        display: block;
      }

      /* tab 樣式 */
      .tabs {
        display: flex;
        margin-bottom: 16px;
      }
      .tab {
        padding: 8px 16px;
        cursor: pointer;
        border: 1px solid #ddd;
        background-color: #f9f9f9;
      }
      .tab:hover {
        background-color: #e9e9e9;
      }
      .tab.active {
        border-bottom: none;
        background-color: white;
        font-weight: bold;
      }
    </style>
  `;

  // 更新 showSheet 函數
  const script = `<script>
    function showSheet(sheetId, tabElement) {
      document.querySelectorAll('.sheet').forEach(sheet => {
        sheet.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(sheetId).classList.add('active');
      tabElement.classList.add('active');
    }
  </script>`;

  return style + tabsHtml + sheetsHtml + script;
}
