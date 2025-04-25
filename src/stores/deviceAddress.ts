import { defineStore, storeToRefs } from 'pinia';
import { date } from 'quasar';
import { useDeviceAlertStore } from './deviceAlert';

export type parseContent = [
  {
    Key: '設備狀態';
    Value: { 動作: string; 控制: string; 傳送異常: string; 故障: string };
  },
  {
    Key: '設備區分';
    Value: string;
  }
];

type DeviceAddressViewModel = any;
type DeviceNotifyViewModel = any;
type DeviceViewModel = any;
type FunctionCodes = any;
export interface ReceiveDeviceAddressViewModel {
  id: number;
  dateTime: string;
  deviceAddress: DeviceAddressViewModel;
  numberOfPoints: number;
  value?: string | null;
  content?: string | parseContent;
  state?: string | null;
  deviceNotify?: DeviceNotifyViewModel;
}

// Fetck03 Enum
export enum fatek03Control {
  'R-200-0',
  'R-200-1',
  'R-200-2',
  'R-200-3',
  'R-200-4',
  'R-200-5',
  'R-200-6',
  'R-200-7',
  'R-200-8',
  'R-200-9',
  'R-200-10',
  'R-200-11',
  'R-200-12',
  'R-200-13',
  'R-200-14',
  'R-200-15',
}
export enum fatek03State {
  'R-100-1',
  'R-100-2',
  'R-100-3',
  'R-100-4',
  'R-100-5',
  'R-100-6',
  'R-100-7',
  'R-100-8',
  'R-100-9',
  'R-100-10',
  'R-100-11',
  'R-100-12',
  'R-100-13',
  'R-100-14',
  'R-100-15',
}
export interface ReceiveViewModel {
  id: number;
  master: DeviceViewModel;
  functionCode: FunctionCodes;
  system?: string;
  address?: number;
  number?: number;
  dateTime: string;
  topic: string;
  deviceAddresses: ReceiveDeviceAddressViewModel[];
}

export const useDeviceAddressStore = defineStore('deviceAddress', () => {
  // 設備訊息 WS
  const nohmi02 = ref(); // 防災盤
  const nohmi03 = ref();
  const fatek03 = ref<{
    driver: 'fatek';
    points: { [key: string]: string | number };
  }>();
  const amsamotion02 = ref<{
    driver: 'amsamotion';
    points: { [key: string]: string | number };
  }>();
  const mitsubishi = ref<{
    driver: 'mitsubishi';
    points: { [key: string]: string | number };
  }>();

  // 來自其他 store
  const deviceAlertStore = useDeviceAlertStore();
  const { deviceNotify, ifAutoShowDeviceAlertDialog } =
    storeToRefs(deviceAlertStore);

  // 方法
  function deviceAddressFormat(model: ReceiveViewModel) {
    model.dateTime = date.formatDate(
      new Date(model.dateTime),
      'YYYY-MM-DD HH:mm:ss'
    );
    const { topic } = model;
    // console.log("model", model);
    if (topic?.includes('nohmi')) {
      const driver = 'nohmi';
      if (topic.includes('02')) {
        console.log('nohmi02', model);
      } else if (topic.includes('03')) {
        const points: { [key: string]: string } = {};
        model.deviceAddresses.forEach((point) => {
          point.content = JSON.parse(point.content as string);
          const { content, deviceAddress } = point;
          const { system, address, number } = deviceAddress;
          const key = `${system}-${address}-${number}`;
          const state = (content as parseContent)[0].Value['動作'];
          points[key] = formatPoint(state);
        });
        nohmi03.value = { driver, points };
        console.log('now nohmi03.value', nohmi03.value);
      }
    } else if (topic?.includes('fatek')) {
      const driver = 'fatek';
      const points: { [key: string]: string | number } = {};
      model.deviceAddresses.forEach((point) => {
        const {
          deviceAddress,
          value,
          deviceNotify: notifyData,
          dateTime,
        } = point;
        const { system, address, number, device } = deviceAddress;
        const key =
          number === undefined || number === null
            ? `${system}-${address}`
            : `${system}-${address}-${number}`;
        if (value && !isNaN(+value)) points[key] = Number(value); // 水位計用
        else points[key] = value === 'False' ? '關' : '開';

        // 設備警示資料整理
        if (notifyData) {
          notifyData.dateTime = date.formatDate(
            new Date(dateTime),
            'YYYY-MM-DD HH:mm:ss'
          );
          notifyData.device = device;

          deviceNotify.value.unshift(notifyData);
          if (ifAutoShowDeviceAlertDialog) deviceAlertStore.openDialog();
        }
      });
      if (!fatek03.value) {
        fatek03.value = { driver, points };
      } else {
        for (const key in points) {
          fatek03.value.points[key] = points[key];
        }
      }
      console.log('now fatek03.value', fatek03.value);
    } else if (topic?.includes('amsamotion')) {
      console.log('amsamotion model', model);
      const driver = 'amsamotion';
      const points: { [key: string]: string } = {};
      model.deviceAddresses.forEach((point) => {
        const { deviceAddress, state } = point;
        const { system, address, number } = deviceAddress;
        const key = `${system}-${address}-${number}`;
        if (state && state !== '') points[key] = state;
      });
      if (!amsamotion02.value) {
        amsamotion02.value = { driver, points };
      } else {
        for (const key in points) {
          amsamotion02.value.points[key] = points[key];
        }
      }
      console.log('now amsamotion02.value', amsamotion02.value);
    } else if (topic?.includes('mitsubishi')) {
      // mitsubishi01、mitsubishi03(水位計)合併
      console.log('mitsubishi model', model);
      const driver = 'mitsubishi';
      const points: { [key: string]: string | number } = {};
      model.deviceAddresses.forEach((point) => {
        const {
          deviceAddress,
          value,
          deviceNotify: notifyData,
          dateTime,
        } = point;
        const { system, number, device } = deviceAddress;
        const key = `${system}-${number}`;
        if (value && !isNaN(+value)) points[key] = Number(value); // 水位計用
        else points[key] = value === 'False' ? '關' : '開';

        // 設備警示資料整理
        if (notifyData) {
          notifyData.dateTime = date.formatDate(
            new Date(dateTime),
            'YYYY-MM-DD HH:mm:ss'
          );
          notifyData.device = device;

          deviceNotify.value.unshift(notifyData);
          if (ifAutoShowDeviceAlertDialog) deviceAlertStore.openDialog();
        }
      });

      if (!mitsubishi.value) {
        mitsubishi.value = { driver, points };
      } else {
        for (const key in points) {
          mitsubishi.value.points[key] = points[key];
        }
      }
      console.log('now mitsubishi.value', mitsubishi.value);
    }
  }
  function formatPoint(state: string) {
    switch (state) {
      case '正常':
        return '關';
      case '注意':
        return '注意';
      case '作動':
        return '開';
      case '注意/作動':
        return '開';
      default:
        return state;
    }
  }

  function setFatek03ControlValueByState(
    stateIndex: number | string,
    stateValue: number,
    array: number[]
  ) {
    if (typeof stateIndex === 'string') {
      stateIndex = fatek03State[stateIndex as keyof typeof fatek03State];
    }
    switch (stateIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8: {
        const controlIndex = stateIndex + 1;
        array[controlIndex] = stateValue;
        break;
      }
      case 9:
        array[0] = 0;
        array[10] = 0;
        array[11] = 0;
        break;
      case 10:
        array[12] = 0;
        array[13] = 0;
        break;
      case 11:
      case 13:
        break;
      case 12:
        array[14] = stateValue;
        break;
      case 14:
        array[15] = stateValue;
    }
  }
  function getFatek03ControlArray() {
    const controlArray = new Array(16).fill(0);
    for (const key in fatek03.value?.points) {
      setFatek03ControlValueByState(
        fatek03State[key as keyof typeof fatek03State],
        fatek03.value?.points[key as string] === '關' ? 0 : 1,
        controlArray
      );
    }
    return controlArray;
  }

  return {
    nohmi02,
    nohmi03,
    fatek03,
    amsamotion02,
    mitsubishi,
    deviceAddressFormat,
    getFatek03ControlArray,
  };
});
