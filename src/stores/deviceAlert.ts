import { defineStore } from 'pinia';
import { date, Notify } from 'quasar';

type DeviceNotifyViewModel = any;
type alertBtnOptions = any;

export const useDeviceAlertStore = defineStore('deviceAlert', () => {
  const deviceAlertModel = ref(false); // 控制設備異常彈窗開關
  const ifAutoShowDeviceAlertDialog = ref(
    +(localStorage.getItem('ifAutoShowDeviceAlertDialog') || '1')
  ); // 是否允許設備異常永遠自動彈出該視窗?
  const deviceNotify = ref<DeviceNotifyViewModel[]>([
    // {
    //   dateTime: new Date(Date.now()),
    //   receiveDeviceAddressId: 1,
    //   processed: false,
    //   deleted: false,
    //   device: {
    //     id: 217,
    //     building: {
    //       id: 66,
    //       name: "板橋喬峰",
    //       address: "新北市板橋區三民路一段",
    //       area: 9520,
    //       height: 1235,
    //       licenseNumber: "WW2830",
    //       licenseDate: null,
    //       groundFloor: null,
    //       basementFloor: null,
    //       fireManagers: [],
    //       phoneNumber: null,
    //       use: null,
    //       inspectionPlaceJob: null,
    //       publicPlaceJob: null,
    //       chairman: null,
    //       executiveSecretary: null,
    //       organizationFileId: null,
    //       organizationFilePath: null,
    //       protectionFileId: null,
    //       protectionFilePath: null,
    //     },
    //     floor: {
    //       id: 452,
    //       building: {
    //         id: 66,
    //         name: "板橋喬峰",
    //         address: "新北市板橋區三民路一段",
    //         area: 9520,
    //         height: 1235,
    //         licenseNumber: "WW2830",
    //         licenseDate: null,
    //         groundFloor: null,
    //         basementFloor: null,
    //         fireManagers: [],
    //         phoneNumber: null,
    //         use: null,
    //         inspectionPlaceJob: null,
    //         publicPlaceJob: null,
    //         chairman: null,
    //         executiveSecretary: null,
    //         organizationFileId: null,
    //         organizationFilePath: null,
    //         protectionFileId: null,
    //         protectionFilePath: null,
    //       },
    //       area: {
    //         id: 2,
    //         name: "11-14F",
    //         description: null,
    //         building: {
    //           id: 66,
    //           name: "板橋喬峰",
    //           address: "新北市板橋區三民路一段",
    //           area: 9520,
    //           height: 1235,
    //           licenseNumber: "WW2830",
    //           licenseDate: null,
    //           groundFloor: null,
    //           basementFloor: null,
    //           fireManagers: [],
    //           phoneNumber: null,
    //           use: null,
    //           inspectionPlaceJob: null,
    //           publicPlaceJob: null,
    //           chairman: null,
    //           executiveSecretary: null,
    //           organizationFileId: null,
    //           organizationFilePath: null,
    //           protectionFileId: null,
    //           protectionFilePath: null,
    //         },
    //       },
    //       name: "12F",
    //       isUnderground: false,
    //       dataFileId: 3,
    //       dataFilePath: "Floor452Hidden:\\Test.txt",
    //       floorPlanFileId: null,
    //       floorPlanFilePath: null,
    //       evacuationRouteFileId: null,
    //       evacuationRouteFilePath: null,
    //       sort: 12,
    //     },
    //     addressPlate: null,
    //     floors: [],
    //     deviceType: {
    //       id: 155,
    //       name: "電燈",
    //       brand: "能美",
    //       useType: 2,
    //       fullTypeValues: [
    //         "Uncategorized",
    //         "nDeviceTypeList.OE.OE_ElectricLight",
    //       ],
    //       driver: null,
    //       certificationNumber: null,
    //       productId: "FSKF222-B",
    //       maintainFrequency: null,
    //       maintainCustom: null,
    //       frontCoverFileId: null,
    //       frontCoverFilePath: null,
    //       currentMaintainId: null,
    //       currentMaintainCompleted: null,
    //       nextMaintainDate: null,
    //       condition: 1,
    //     },
    //     name: "會議室電燈-1",
    //     purchaseDate: null,
    //     location: "大會議室",
    //     groupID: null,
    //     warrantyDate: null,
    //     master: null,
    //     camera: null,
    //     pool: null,
    //     lastMaintain: null,
    //     note: "test4",
    //     isShortcut: true,
    //     keeperUnit: {
    //       id: 1,
    //       community: {
    //         id: 2,
    //         number: 2,
    //         start: "2023-09-01",
    //         end: "2023-09-30",
    //       },
    //       user: {
    //         id: "0a281d96-2b3d-4a22-80cb-bb3a859e6ad5",
    //         account: "潘震",
    //         fullname: "潘震",
    //         password: null,
    //         email: "mf58@mercuryfire.com.tw",
    //         emailConfirmed: false,
    //         phoneNumber: "0988292474",
    //         lockout: false,
    //         roleBuildings: [],
    //         roleAddressPlates: [],
    //         groupRole: {
    //           id: "e8f1d6ec-22c0-4a82-be08-45e82e4f88ae",
    //           name: "Fire",
    //           type: 2,
    //           description: "滅火班",
    //           isEmergency: null,
    //           order: 1,
    //         },
    //         groupId: 28,
    //         roles: [
    //           {
    //             id: "ba987532-cf78-4a98-9385-0207f20f82e3",
    //             name: "Member",
    //             type: 1,
    //             description: "住戶/店家",
    //             isEmergency: true,
    //             order: null,
    //           },
    //           {
    //             id: "e8f1d6ec-22c0-4a82-be08-45e82e4f88ae",
    //             name: "Fire",
    //             type: 2,
    //             description: "滅火班",
    //             isEmergency: null,
    //             order: 1,
    //           },
    //         ],
    //         phoneNumber2: [],
    //         identityCard: "A129741376",
    //         addressPlateConfirmeds: {},
    //         birthday: null,
    //         contactNumber: null,
    //         emergencyContact: null,
    //         emergencyNumber: null,
    //         emergencyNumber2: [],
    //         mugShotFileId: null,
    //         note: null,
    //         sex: null,
    //         isDisability: null,
    //         switchs: 0,
    //         fromAccountId: null,
    //       },
    //       title: {
    //         id: 146,
    //         type: 8,
    //         label: "設備委員",
    //         yearValue: null,
    //         monthValues: [],
    //         order: 2,
    //       },
    //       note: null,
    //     },
    //     maintainVendor: {
    //       id: 17,
    //       system: {
    //         id: 35,
    //         type: 0,
    //         label: "消防機電",
    //         yearValue: null,
    //         monthValues: [],
    //         order: 1,
    //       },
    //       name: "中法消防技術有限公司",
    //       businessProjects: "消防維護保養",
    //       address: "新北市板橋區民生路59號1樓",
    //       collaborate: false,
    //       note: null,
    //       contactName: "吳明偉",
    //       contactNumber: "0229363991",
    //       contactPhoneNumber: "0988292474",
    //       contactEmail: "andy820621@gmail.com",
    //       chargeName: null,
    //       chargeNumber: null,
    //       chargePhoneNumber: null,
    //       chargeEmail: null,
    //       chargeFaxNumber: null,
    //     },
    //     gateway: 0,
    //     iconId: "fire_o1",
    //     isFaulty: false,
    //     condition: 1,
    //     isNotified: true,
    //   },
    //   notifyResults: [],
    // },
  ]);
  const deviceNotifiesLength = computed(
    () => processingAlertDevice.value.length
  ); // 顯示在按鈕上
  const formattedDeviceNotify = computed(() => {
    return deviceNotify.value.map((item) => {
      item.dateTime = date.formatDate(
        new Date(item.dateTime),
        'YYYY-MM-DD HH:mm:ss'
      );

      // format notifyResult
      if (item.notifyResults?.length) {
        item.formattedNotifyResults = groupByDateTime(item.notifyResults);
      } else item.formattedNotifyResults = {};

      // 判斷設備是否有按鈕
      let options: alertBtnOptions | undefined;
      const { keeperUnit, maintainVendor } = item.device;
      if (keeperUnit && maintainVendor) {
        options = {
          all: true,
          keeperUnit: true,
          maintainVendor: true,
        };
      } else if (keeperUnit) {
        options = {
          all: true,
          keeperUnit: true,
        };
      } else if (maintainVendor) {
        options = {
          all: true,
          maintainVendor: true,
        };
      }
      if (options) item.options = options;

      return item;
    });
  });

  const processingAlertDevice = computed(() =>
    formattedDeviceNotify.value.filter((item) => !item.processed)
  );
  const processedAlertDevice = computed(() =>
    formattedDeviceNotify.value.filter((item) => item.processed)
  );

  // TODO：可刪掉？
  // async function getDeviceNotifyData() {
  //   const newData = [];

  //   // 獲取未處理的設備
  //   const processingResult = await DeviceNotify.apiGetData({
  //     processed: false,
  //     page: 1,
  //     rowsPerPage: 0,
  //   });
  //   if (processingResult.data.rows) newData.push(...processingResult.data.rows);
  //   else {
  //     Notify.create({
  //       type: 'negative',
  //       message: '獲取未處理的設備資料失敗',
  //       position: 'top',
  //     });
  //   }

  //   // 獲取已通知的設備
  //   const processedResult = await DeviceNotify.apiGetData({
  //     processed: true,
  //     page: 1,
  //     rowsPerPage: 0,
  //   });
  //   if (processedResult.data.rows) newData.push(...processedResult.data.rows);
  //   else {
  //     Notify.create({
  //       type: 'negative',
  //       message: '獲取已通知的設備資料失敗',
  //       position: 'top',
  //     });
  //   }

  //   // 清空舊資料
  //   deviceNotify.value.length = 0;
  //   if (newData.length) deviceNotify.value.push(...newData);
  // }

  function groupByDateTime(array: any[]) {
    // 按 dateTime 排序，早的在前
    const sortedArray = array.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    return sortedArray.reduce((acc, item) => {
      const key = date.formatDate(
        new Date(item.dateTime),
        'YYYY-MM-DD HH:mm:ss'
      );
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);

      return acc;
    }, {} as any);
  }

  function openDialog() {
    deviceAlertModel.value = true;
  }

  return {
    deviceAlertModel,
    ifAutoShowDeviceAlertDialog,
    deviceNotify,
    deviceNotifiesLength,
    processingAlertDevice,
    processedAlertDevice,
    // getDeviceNotifyData,
    openDialog,
  };
});
