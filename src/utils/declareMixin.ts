import { tableConfigItem } from "./tableMixin";

export default function declareMixin() {
  const residentialOrCommercial = [
    {
      label: "住宅",
      value: 0,
    },
    {
      label: "商用",
      value: 1,
    },
  ];
  const selfUseOrRent = [
    {
      label: "自用",
      value: 0,
    },
    {
      label: "租賃",
      value: 1,
    },
  ];
  const declareWay = [
    {
      label: "自行申報",
      value: true,
    },
    {
      label: "共同申報",
      value: false,
    },
  ];
  const remindList = [
    {
      label: "一個月",
      value: 0,
    },
    {
      label: "一周",
      value: 1,
    },
    {
      label: "",
      value: 2,
    },
  ];
  const declareRadioOptions = computed(() => (configName: string) => {
    let result = [];
    if (configName === "use") {
      result = residentialOrCommercial;
    } else if (configName === "purpose") {
      result = selfUseOrRent;
    } else if (
      configName === "inspectionPlaceSelf" ||
      configName === "publicPlaceSelf"
    ) {
      result = declareWay;
    } else {
      result = remindList;
    }
    return result;
  });
  function declareOptionAction(
    configName: string,
    optionValue: number,
    tableConfig:tableConfigItem[],
    btnStatus?:string
  ) {
    console.log("optionAction", configName, optionValue);
    // 住宅/商用
    const nameConfigObj = tableConfig.find((item) => item.name === "name");
    const businessHoursConfigObj = tableConfig.find(
      (item) => item.name === "businessHours"
    );
    const spatialConfigObj = tableConfig.find((item) => item.name === "spatial");
    // 自用/租賃
    const ownerConfigObj = tableConfig.find((item) => item.name === "owner");
    const landlordUserNameConfigObj = tableConfig.find(
      (item) => item.name === "landlordUserName"
    );
    const landlordPhoneNumberConfigObj = tableConfig.find(
      (item) => item.name === "landlordPhoneNumber"
    );
    if (
      configName === "use" &&
      nameConfigObj &&
      businessHoursConfigObj &&
      spatialConfigObj
    ) {
      if (!optionValue) {
        nameConfigObj.isDialogForm = false;
        businessHoursConfigObj.isDialogForm = false;
        spatialConfigObj.isDialogForm = false;
      } else if (optionValue === 1) {
        nameConfigObj.isDialogForm = true;
        businessHoursConfigObj.isDialogForm = true;
        spatialConfigObj.isDialogForm = true;
      }
    } else if (
      configName === "purpose" &&
      ownerConfigObj &&
      landlordUserNameConfigObj &&
      landlordPhoneNumberConfigObj
    ) {
      if (!optionValue) {
        ownerConfigObj.isDialogForm = false;
        landlordUserNameConfigObj.isDialogForm = false;
        landlordPhoneNumberConfigObj.isDialogForm = false;
      } else if (optionValue === 1) {
        if (btnStatus !== "add") {
        ownerConfigObj.isDialogForm = true;
       }
        landlordUserNameConfigObj.isDialogForm = true;
        landlordPhoneNumberConfigObj.isDialogForm = true;
      }
    } else if (configName === "inspectionPlaceSelf" || configName === "publicPlaceSelf") {
      if (configName === "inspectionPlaceSelf") {
        const inspectionPlaceDateConfigObj = tableConfig.find(
          (item) => item.name === "inspectionPlaceDate"
        );
        const inspectionPlaceRemindConfigObj = tableConfig.find(
          (item) => item.name === "inspectionPlaceRemind"
        );
        if (optionValue) {
          // 自行申報
          if (inspectionPlaceDateConfigObj) {
            inspectionPlaceDateConfigObj.required = true
            inspectionPlaceDateConfigObj.disable = false
          }
          if (inspectionPlaceRemindConfigObj) {
            inspectionPlaceRemindConfigObj.required = true;
            inspectionPlaceRemindConfigObj.disable = false
          }
        } else {
          // 共同申報
          if (inspectionPlaceDateConfigObj) {
            inspectionPlaceDateConfigObj.required = false
            inspectionPlaceDateConfigObj.disable = true
          }
          if (inspectionPlaceRemindConfigObj) {
            inspectionPlaceRemindConfigObj.required = false
            inspectionPlaceRemindConfigObj.disable = true
          }
        }
      }
       if (configName === "publicPlaceSelf") {
        const publicPlaceDateConfigObj = tableConfig.find(
          (item) => item.name === "publicPlaceDate"
        );
        const publicPlaceRemindConfigObj = tableConfig.find(
          (item) => item.name === "publicPlaceRemind"
        );
        if (optionValue) {
          // 自行申報
          if (publicPlaceDateConfigObj) {
            publicPlaceDateConfigObj.required = true
            publicPlaceDateConfigObj.disable = false
          }
          if (publicPlaceRemindConfigObj) {
            publicPlaceRemindConfigObj.required = true
            publicPlaceRemindConfigObj.disable = false
          }
        } else {
          // 共同申報
          if (publicPlaceDateConfigObj) {
            publicPlaceDateConfigObj.required = false
            publicPlaceDateConfigObj.disable = true
          }
          if (publicPlaceRemindConfigObj) {
            publicPlaceRemindConfigObj.required = false
            publicPlaceRemindConfigObj.disable = true
          }
        }
      }
    }
  }
  return {
    declareRadioOptions,
    declareOptionAction
  };
}
