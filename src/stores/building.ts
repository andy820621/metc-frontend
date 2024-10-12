import { defineStore } from "pinia";
import { ref } from "vue";
import Building, { BuildingViewModel } from "src/api/building";

export const useBuildingStore = defineStore("building", () => {
  const Bid = ref<number>();
  const nowFloorId = ref<number>(); // 消防支援需要
  const buildingDataList = ref<BuildingViewModel[]>([]);
  const buildingData = ref<BuildingViewModel>();
  const buildingTableConfig = ref([
    {
      label: "建築物名稱",
      name: "name",
      field: "name",
      align: "left",
      formType: "inputString",
      message: "請輸入 名稱",
      isTable: true,
      isDialogForm: true,
      required: false,
      // 進階搜尋用
      searchType: "string",
      searchOption: { label: "建築物名稱", val: "Name", isDefault: true },
    },
    {
      label: "地址",
      name: "address",
      field: "address",
      align: "left",
      formType: "inputString",
      message: "請選擇 地址",
      isTable: true,
      isDialogForm: true,
      required: false,
      // 進階搜尋用
      searchType: "string",
      searchOption: { label: "地址", val: "Address" },
    },
    {
      label: "面積",
      name: "area",
      field: "area",
      align: "left",
      formType: "inputNumber",
      message: "請輸入 面積",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "高度",
      name: "height",
      field: "height",
      align: "left",
      formType: "inputNumber",
      message: "請輸入 高度",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "地上樓層",
      name: "groundFloor",
      field: "groundFloor",
      align: "left",
      formType: "inputNumber",
      message: "請輸入 地上樓層",
      isTable: true,
      isDialogForm: true,
      required: false,
    },
    {
      label: "地下樓層",
      name: "basementFloor",
      field: "basementFloor",
      align: "left",
      formType: "inputNumber",
      message: "請輸入 地下樓層",
      isTable: true,
      isDialogForm: true,
      required: false,
    },
    {
      label: "使用執照字號",
      name: "licenseNumber",
      field: "licenseNumber",
      align: "left",
      formType: "inputString",
      message: "請選擇 使用執照字號",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "使照日",
      name: "licenseDate",
      field: "licenseDate",
      align: "left",
      formType: "date",
      message: "請選擇 日期",
      isTable: false,
      isDialogForm: false,
      required: false,
    },
    {
      label: "場所電話",
      name: "phoneNumber",
      field: "phoneNumber",
      align: "left",
      formType: "inputString",
      message: "請輸入 場所電話",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "場所用途",
      name: "use",
      field: "use",
      align: "left",
      formType: "inputString",
      message: "請輸入 場所用途",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    // 檢修申報
    {
      label: "申報時間",
      name: "inspectionPlaceDate",
      field: "inspectionPlaceDate",
      align: "left",
      formType: "selectString",
      message: "請選擇 申報時間",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "申報提醒",
      name: "inspectionPlaceRemind",
      field: "inspectionPlaceRemind",
      align: "left",
      formType: "radioOption",
      message: "請選擇 申報提醒",
      isTable: false,
      isDialogForm: true,
      required: false,
    },

    // 公安申報
    {
      label: "申報時間",
      name: "publicPlaceDate",
      field: "publicPlaceDate",
      align: "left",
      formType: "selectString",
      message: "請選擇 申報時間",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "申報提醒",
      name: "publicPlaceRemind",
      field: "publicPlaceRemind",
      align: "left",
      formType: "radioOption",
      message: "請選擇 申報提醒",
      isTable: false,
      isDialogForm: true,
      required: false,
    },
    {
      label: "防火管理人",
      name: "fireManagers",
      field: (row: BuildingViewModel) =>
        row.fireManagers.map((item) => item.fullname).join("、"),
      align: "left",
      formType: "selectMany",
      message: "請輸入 防火管理人",
      isTable: true,
      isDialogForm: true,
      required: false,
      // 進階搜尋用
      searchType: "string",
      searchOption: { label: "防火管理人", val: "FireManagers" },
    },
    {
      label: "主任委員",
      name: "chairman",
      field: (row: BuildingViewModel) => row.chairman?.fullname,
      align: "left",
      formType: "selectString",
      message: "請輸入 主任委員",
      isTable: true,
      isDialogForm: true,
      required: false,
      // 進階搜尋用
      searchType: "string",
      searchOption: { label: "主任委員", val: "Chairman" },
    },
    {
      label: "總幹事",
      name: "executiveSecretary",
      field: (row: BuildingViewModel) => row.executiveSecretary?.fullname,
      align: "left",
      formType: "selectString",
      message: "請輸入 總幹事",
      isTable: true,
      isDialogForm: true,
      required: false,
      // 進階搜尋用
      searchType: "string",
      searchOption: { label: "總幹事", val: "ExecutiveSecretary" },
    },
  ]);
  async function getBuildingsData() {
    const localBuildingId = localStorage.getItem("Bid");
    const result = (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
    buildingDataList.value = result.data;
    let localBuildingData;
    if (localBuildingId) {
      localBuildingData = buildingDataList.value.find(
        (list) => list.id === parseInt(localBuildingId)
      );
    }
    buildingData.value = localBuildingData || buildingDataList.value[0];
    Bid.value = buildingData.value?.id;
    if (Bid.value) localStorage.setItem("Bid", Bid.value.toString());
  }

  return {
    Bid,
    nowFloorId,
    buildingData,
    buildingDataList,
    buildingTableConfig,
    getBuildingsData,
  };
});
