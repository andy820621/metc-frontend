import { req } from "boot/axios";
// import type { pagination } from "./api.type";

// 檔案
const File = {
  // 上傳檔案(一次一個)於當下目錄 c
  apiUploadFile(payload: FormData, path?: string) {
    if (path) {
      return req("uploadPost", `/File/writeallbytes?path=${path}`, payload);
    }
    return req("uploadPost", "/File/writeallbytes", payload);
  },
  // 由 id 讀取檔案
  apiFileById(id: number) {
    return req("post", `/File/${id}/idallbytes`, null);
  },
  // 由 path 讀取檔案
  // ex: 取得該樓層平面圖 base64 的資料
  apiFileByPath(path: string) {
    return req("post", `/File/${path}/pathallbytes`, null);
  },
  // 刪除檔案
  apiDeleteFile(path: string) {
    return req("post", `/File/filedelete?path=${path}`, null);
  },
  // 建立資料夾
  apiCreateFolder(path: string) {
    return req("post", `/File/createdirectory?path=${path}`, null);
  },
  // 刪除資料夾
  apiDeleteFolder(path: string) {
    return req("post", `/File/directorydelete?path=${path}`, null);
  },
  // 更改檔案名稱
  apiPatchFileName(sourceFileName: string, destFileName: string) {
    return req(
      "post",
      `/File/filemove?sourceFileName=${sourceFileName}&?destFileName=${destFileName}`,
      null
    );
  },
  // 更改資料夾名稱
  apiPatchFolderName(sourceFileName: string, destFileName: string) {
    return req(
      "post",
      `/File/directorymove?sourceFileName=${sourceFileName}&?destFileName=${destFileName}`,
      null
    );
  },
  // 列出該層資料夾中所有檔案
  apiGetFileList(path: string) {
    return req("post", `/File/getfiles?path=${path}`, null);
  },
  // 列出該層資料夾中所有資料夾
  apiGetFolderList(path: string) {
    return req("post", `/File/getdirectories?path=${path}`, null);
  },
  // 設定防護計畫書
  apiSetProtectionPlan(buildingId: number, path: string) {
    return req("patch", `/building/${buildingId}/protection?path=${path}`);
  },
  // 設定組織架構圖
  apiSetOrganizationChart(buildingId: number, path: string) {
    return req("patch", `/building/${buildingId}/organization?path=${path}`);
  },
  // 設定缺失內容檔案
  apiSetIncompleteFile(routineId:number, path:string) {
    // routineId : 例行檢查 id, path:檔案路徑
    return req("patch", `/Routine/${routineId}/incomplete?path=${path}`);
  }
};

export default File;
