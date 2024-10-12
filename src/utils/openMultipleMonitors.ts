import { Notify, uid } from "quasar";
import Screen from "src/api/screen";
import { sideBarPathMaps } from "src/router/routes";

function createPopup(
  url: string,
  screenX: number,
  screenY: number,
  width: number,
  height: number
) {
  const features = [
    `left=${screenX}`,
    `top=${screenY}`,
    `width=${width}`,
    `height=${height}`,
    "menubar=no",
    "toolbar=no",
    "location=no",
    "status=no",
    "resizable=yes",
    "scrollbars=no",
  ].join(",");

  return window.open(url, uid(), features);
}

// TODO: 類型我亂定義的，之後如果官方有定義完整的要改使用官方的
type MyScreen = Screen & ScreenOrientation;
type ScreenDetails = {
  screens: MyScreen[];
  currentScreen: MyScreen;

  onscreenschange: Event;
  oncurrentscreenchange: Event;
} & ScreenOrientation;
declare global {
  interface Window {
    getScreens(): Promise<ScreenDetails>;
    getScreenDetails(): Promise<ScreenDetails>;
  }
}

let cachedScreens: ScreenDetails;
let popupMonitor: number | undefined; // 用於監聽彈出視窗的關閉
const popups: Window[] = [];
const isSupported = "getScreens" in window || "getScreenDetails";

async function getScreensInfo() {
  if (isSupported) {
    if (cachedScreens) {
      return cachedScreens.screens;
    } else {
      cachedScreens =
        "getScreens" in window
          ? await window.getScreens()
          : await (window as Window).getScreenDetails();
      // cachedScreens.addEventListener("screenschange", async (e) => {
      //   console.log("screenschange", e);
      //   closeAllPopups();
      //   await openMultipleMonitors();
      // });
      // cachedScreens.addEventListener("currentscreenchange", async (e) => {
      //   console.log("currentscreenchange", e);
      // });
      return cachedScreens.screens;
    }
  } else {
    alert("您的瀏覽器不支援多螢幕偵測，因此無法開啟彈出視窗。");
  }
  return [window.screen];
}

export function closeAllPopups() {
  popups.forEach((popup) => {
    popup.close();
  });
  popups.length = 0;
  clearInterval(popupMonitor);
}

function checkPopupClose() {
  popups.forEach((popup) => {
    if (popup.closed) {
      closeAllPopups();
    }
  });
}

export async function openMultipleMonitors() {
  if (window.self !== window.top) {
    window.open(location.href); //, "", "noopener,noreferrer");
    return;
  }

  const screens = await getScreensInfo();

  // 視窗上方擋板高度和左側擋板寬度的設定
  const WINDOW_CHROME_Y = 51;
  const WINDOW_CHROME_X = 1;

  // 獲取視窗資料
  let urlArray: { url: string; screenIndex: number }[] = [];
  const result = await Screen.apiGetScreenData();

  if (result.data) {
    const nowPaths: string[] = JSON.parse(
      localStorage.getItem("visitedPages") || "[]"
    );

    urlArray = result.data
      .map((item) => ({
        url: sideBarPathMaps[item.menuName],
        screenIndex: item.index,
      }))
      .filter((item) => !nowPaths.includes(item.url));
  }

  if (!urlArray.length) {
    Notify.create({
      type: "warning",
      message: "尚未設定任何視窗，請先設定視窗 / 所有視窗已被開啟",
      position: "top",
    });
    return;
  }

  const indexCounts = urlArray.reduce((acc, cur) => {
    const { screenIndex } = cur;
    if (acc[screenIndex]) acc[screenIndex]++;
    else acc[screenIndex] = 1;
    return acc;
  }, [] as number[]);

  popups.length = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  screens.forEach((screen: any, index: number) => {
    const screenMonitorNums = indexCounts[index];
    const width = Math.floor(
      (screen.availWidth - screenMonitorNums * WINDOW_CHROME_X) /
        screenMonitorNums
    );
    const height = screen.availHeight;
    for (let i = 0; i < screenMonitorNums; i++) {
      const screenX = i * width + screen.availLeft + i * WINDOW_CHROME_X;
      const screenY = screen.availTop + WINDOW_CHROME_Y;
      const url = urlArray.shift()?.url;
      const popup = createPopup(url as string, screenX, screenY, width, height); // 創建彈出視窗

      if (!popup) {
        alert(
          "看起來您已封鎖彈出窗口。請按照 https://goo.gle/allow-popups 中的說明允許它們。"
        );
        return;
      }

      popups.push(popup);
    }
  });

  popupMonitor = setInterval(checkPopupClose, 500) as unknown as number;
}
