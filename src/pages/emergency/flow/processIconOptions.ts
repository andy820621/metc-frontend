import {
  matNotifications,
  matRecordVoiceOver,
  matMessage,
  matHideSource,
  matExplicit,
  matFollowTheSigns,
  matDirectionsOff,
} from '@quasar/extras/material-icons';
import { outlinedTimer } from '@quasar/extras/material-icons-outlined';
import { fciFlowChart } from 'quasar-extras-svg-icons/flat-color-icons';
import {
  fuiOval32Regular,
  fuiDocumentPerson20Regular,
  fuiDocumentProhibited20Regular,
} from 'quasar-extras-svg-icons/fluentui-system-icons';
import { antFilledNotification } from 'quasar-extras-svg-icons/ant-design-icons';
import { entypoBack } from 'quasar-extras-svg-icons/entypo-icons';
import { fabLine } from '@quasar/extras/fontawesome-v6';
import {
  mdiMonitorCellphone,
  mdiFireOff,
  mdiFire,
} from '@quasar/extras/mdi-v7';
import { gitlabLocationDot } from 'quasar-extras-svg-icons/gitlab-icons-v3';
import { akarChatError } from 'quasar-extras-svg-icons/akar-icons';
import { bxTask, bxTaskX } from 'quasar-extras-svg-icons/box-icons';

export enum NodeGroup {
  Require = '必要節點',
  Unique = '唯一節點',
  Waiting = '等待節點',
  Button = '按鈕節點',
  Notify = '通知節點',
  Other = '其他節點',
}

export enum iconLabels {
  Wait, // 等待節點
  Start, // 起始點
  Stop, // 結束點
  SubWorkflow, // 連接流程圖
  Broadcast, // 全部通知
  MessageSend, // 簡訊推播
  LinePush, // Line 推播
  NotificationSend, // 手機、電腦推播
  Voice, // 聲音廣播
  CountDown, // 倒數計時
  InPosition, // 已定位
  Retreat, // 已撤退
  Not, // 非火災
  Fire, // 火災
  False, // 誤報
  Failure, // 滅火失敗
  Success, // 滅火成功
  BootFailure, // 引導失敗
  BootSuccess, // 引導成功
  Lift, // 狀況解除
  Begin, // 統計開始
  End, // 統計結束
  CustomForSendLogViewModel = 9999,
}
export enum WaitingNodeLabels {
  InPosition = '已定位',
  Retreat = '已撤退',
  Not = '非火災',
  Fire = '火災',
  False = '誤報',
  Failure = '滅火失敗',
  Success = '滅火成功',
  BootFailure = '引導失敗',
  BootSuccess = '引導成功',
  Lift = '狀況解除',
  Begin = '統計開始',
  End = '統計結束',
}

interface IconOptions {
  iconImg: string;
  nodeType: number;
  value: string;
  group: keyof typeof NodeGroup;
}

const iconOptions: IconOptions[] = [
  {
    nodeType: iconLabels.Wait,
    value: iconLabels[iconLabels.Wait],
    iconImg: fuiOval32Regular,
    group: 'Waiting',
  },
  {
    nodeType: iconLabels.Start,
    value: iconLabels[iconLabels.Start],
    iconImg: matNotifications,
    group: 'Require',
  },
  {
    nodeType: iconLabels.Stop,
    value: iconLabels[iconLabels.Stop],
    iconImg: matHideSource,
    group: 'Require',
  },
  {
    nodeType: iconLabels.SubWorkflow,
    value: iconLabels[iconLabels.SubWorkflow],
    iconImg: fciFlowChart,
    group: 'Other',
  },
  {
    nodeType: iconLabels.Broadcast,
    value: iconLabels[iconLabels.Broadcast],
    iconImg: matRecordVoiceOver,
    group: 'Notify',
  },
  {
    nodeType: iconLabels.MessageSend,
    value: iconLabels[iconLabels.MessageSend],
    iconImg: matMessage,
    group: 'Notify',
  },
  {
    nodeType: iconLabels.LinePush,
    value: iconLabels[iconLabels.LinePush],
    iconImg: fabLine,
    group: 'Notify',
  },
  {
    nodeType: iconLabels.NotificationSend,
    value: iconLabels[iconLabels.NotificationSend],
    iconImg: mdiMonitorCellphone,
    group: 'Notify',
  },
  {
    nodeType: iconLabels.Voice,
    value: iconLabels[iconLabels.Voice],
    iconImg: antFilledNotification,
    group: 'Notify',
  },
  {
    nodeType: iconLabels.CountDown,
    value: iconLabels[iconLabels.CountDown],
    iconImg: outlinedTimer,
    group: 'Other',
  },
  {
    nodeType: iconLabels.InPosition,
    value: iconLabels[iconLabels.InPosition],
    iconImg: gitlabLocationDot,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Retreat,
    value: iconLabels[iconLabels.Retreat],
    iconImg: entypoBack,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Not,
    value: iconLabels[iconLabels.Not],
    iconImg: mdiFireOff,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Fire,
    value: iconLabels[iconLabels.Fire],
    iconImg: mdiFire,
    group: 'Button',
  },
  {
    nodeType: iconLabels.False,
    value: iconLabels[iconLabels.False],
    iconImg: akarChatError,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Failure,
    value: iconLabels[iconLabels.Failure],
    iconImg: bxTaskX,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Success,
    value: iconLabels[iconLabels.Success],
    iconImg: bxTask,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Lift,
    value: iconLabels[iconLabels.Lift],
    iconImg: matExplicit,
    group: 'Button',
  },
  {
    nodeType: iconLabels.Begin,
    value: iconLabels[iconLabels.Begin],
    iconImg: fuiDocumentPerson20Regular,
    group: 'Unique',
  },
  {
    nodeType: iconLabels.End,
    value: iconLabels[iconLabels.End],
    iconImg: fuiDocumentProhibited20Regular,
    group: 'Unique',
  },
  {
    nodeType: iconLabels.BootFailure,
    value: iconLabels[iconLabels.BootFailure],
    iconImg: matDirectionsOff,
    group: 'Button',
  },
  {
    nodeType: iconLabels.BootSuccess,
    value: iconLabels[iconLabels.BootSuccess],
    iconImg: matFollowTheSigns,
    group: 'Button',
  },
];

interface objWithStringKey {
  [index: string]: IconOptions;
}
const iconObjectOptions = iconOptions.reduce((obj: objWithStringKey, item) => {
  obj[item.nodeType] = item;
  return obj;
}, {});

export default iconOptions;
export { iconObjectOptions };

export interface NodeData {
  icon: string;
  name: string;
  id: number;
  isStart?: boolean;
  nodeType: { key: number; value: string };
  stepType: string;
}
function convertToNodeDataArray(originalData: IconOptions[]): NodeData[] {
  return Object.entries(originalData).map(([key, value]) => {
    const id = parseInt(key) + 1;
    const nodeTypeValue = iconLabels[value.nodeType];

    return {
      icon: value.iconImg,
      name: nodeTypeValue,
      id,
      isStart:
        value.nodeType === iconLabels.Start
          ? true
          : value.nodeType === iconLabels.End
          ? false
          : undefined,
      nodeType: { key: value.nodeType, value: nodeTypeValue },
      stepType: value.group,
    };
  });
}

// 使用方法
export const nodeDataArray = convertToNodeDataArray(iconOptions);
