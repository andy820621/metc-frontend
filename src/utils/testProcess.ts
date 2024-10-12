// API
import Process from "src/api/process";
// pinia
import { Dialog, Notify } from "quasar";
export default function testProcess(dialogRef?: Ref) {
  const modelMultiple = ref<{ id: string; name: string; version: number }[]>(
    []
  );
  async function initOptions() {
    const result =
      (await Process.apiGetFireMarchallingRoleLists()) as typeof AxiosResponse;

    if (result.data) {
      console.log("now result data", result.data);

      const formattedData = Object.values(result.data)
        .flatMap((value) => (value ? Object.values(value) : []))
        .reduce((acc, cur) => {
          const result = Object.entries(cur).map(([key, value]) => {
            const [id, version] = key.split("_");
            return { id, name: value as string, version: +version };
          });
          acc.push(...result);
          return acc;
        }, [] as { id: string; name: string; version: number }[]);

      console.log("now formattedData", formattedData);
      modelMultiple.value = formattedData; // 預設全選
    }
  }
  function testProcess() {
    Dialog.create({
      title: "提示",
      message: "確定要開始模擬試驗嗎?",
      persistent: true,
      ok: {
        push: true,
        label: "確定",
      },
      cancel: "取消",
    }).onOk(() => {
      const promises = modelMultiple.value.map((item) => {
        return startProgress(item);
      });

      Promise.all(promises)
        .then((results) => {
          console.log("now results", results);
          Notify.create({
            type: "positive",
            message: "模擬試驗開始",
            position: "top",
          });
        })
        .catch((err) => {
          console.log("now error: ", err);
          Notify.create({
            type: "negative",
            message: "模擬試驗啟動出現狀況",
            position: "top",
          });
        });

      if (dialogRef?.value) dialogRef.value.hide();
    });
  }

  async function startProgress({
    id,
    version,
  }: {
    id: string;
    version: number;
  }) {
    const queryObject = {
      id,
      version,
      testable: true,
      // reference: "123",
    };
    const result = (await Process.apiStartProcess(
      queryObject
    )) as typeof AxiosResponse;

    if (result.data) {
      Notify.create({
        type: "positive",
        message: "啟動成功",
        position: "top",
      });
      return result.data;
    } else {
      Notify.create({
        type: "negative",
        message: "啟動失敗",
        position: "top",
      });
      return false;
    }
  }
  return {
    modelMultiple,
    initOptions,
    testProcess,
    startProgress,
  };
}
