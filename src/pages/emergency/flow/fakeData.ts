import { wfNode } from './flowTypes';

export const basicProcessNodesData = {
  id: '111',
  buildingId: 1,
  groupId: 11,
  description: '主流程圖',
  nodes: [
    {
      type: 'startNode',
      stepDefinition: {
        icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
        name: 'Start',
        id: 2,
        isStart: true,
        nodeType: {
          key: 1,
          value: 'Start',
        },
        stepType: 'Require',
        iconString:
          'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
        header: 'groupItem',
        type: 'startNode',
      },
      id: '3e72d7f1-69dd-43d8-b6db-95eeeb8f97f1',
      position: [461.703125, 158],
      label: '起始點',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
    {
      type: 'flowNode',
      stepDefinition: {
        icon: 'M12 8a8 8 0 1 0 0 16h8a8 8 0 1 0 0-16h-8ZM2 16A10 10 0 0 1 12 6h8a10 10 0 0 1 0 20h-8A10 10 0 0 1 2 16Z|0 0 32 32',
        name: 'Wait',
        id: 1,
        nodeType: {
          key: 0,
          value: 'Wait',
        },
        stepType: 'Waiting',
        iconString:
          'M12 8a8 8 0 1 0 0 16h8a8 8 0 1 0 0-16h-8ZM2 16A10 10 0 0 1 12 6h8a10 10 0 0 1 0 20h-8A10 10 0 0 1 2 16Z|0 0 32 32',
        header: 'groupItem',
        type: 'flowNode',
      },
      id: '712bd326-830f-4534-8d84-966b879c58b5',
      position: [456.12890625, 215.375],
      label: '狀況確認',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
    {
      type: 'flowNode',
      stepDefinition: {
        icon: 'M0,0h24v24H0V0z@@fill:none;&&M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z',
        name: 'Stop',
        id: 3,
        nodeType: {
          key: 2,
          value: 'Stop',
        },
        stepType: 'Require',
        iconString:
          'M0,0h24v24H0V0z@@fill:none;&&M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z',
        header: 'groupItem',
        type: 'flowNode',
      },
      id: 'ca249e07-86b7-423b-85c6-ae35eb49b20d',
      position: [462.12890625, 274.625],
      label: '結束點',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
  ],
  edges: [
    {
      id: '1c1b06dd-797e-40f8-98f3-6acf05d371f3',
      type: 'default',
      data: {},
      label: '',
      markerEnd: 'arrowclosed',
      sourceX: 501.203125,
      sourceY: 183,
      targetX: 501.62890625,
      targetY: 212.375,
      sourceId: '3e72d7f1-69dd-43d8-b6db-95eeeb8f97f1',
      targetId: '712bd326-830f-4534-8d84-966b879c58b5',
    },
    {
      id: 'c7438dc2-c8e1-42af-b2c8-1978a7c3be10',
      type: 'default',
      data: {},
      label: '',
      markerEnd: 'arrowclosed',
      sourceX: 501.62890625,
      sourceY: 240.375,
      targetX: 501.62890625,
      targetY: 271.625,
      sourceId: '712bd326-830f-4534-8d84-966b879c58b5',
      targetId: 'ca249e07-86b7-423b-85c6-ae35eb49b20d',
    },
  ],
  position: [-1312.6896809633881, -396.39907121126294],
  zoom: 3.6756515339162,
};

export const fireMarshallingProcessNodesData = {
  id: '111',
  buildingId: 1,
  groupId: 11,
  description: '主流程圖',
  nodes: [
    {
      type: 'startNode',
      stepDefinition: {
        icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
        name: 'Start',
        id: 2,
        isStart: true,
        nodeType: {
          key: 1,
          value: 'Start',
        },
        stepType: 'Require',
        iconString:
          'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
        header: 'groupItem',
        type: 'startNode',
      },
      id: '3e72d7f1-69dd-43d8-b6db-95eeeb8f97f1',
      position: [461.703125, 158],
      label: '起始點',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
    {
      type: 'flowNode',
      stepDefinition: {
        icon: 'M12 8a8 8 0 1 0 0 16h8a8 8 0 1 0 0-16h-8ZM2 16A10 10 0 0 1 12 6h8a10 10 0 0 1 0 20h-8A10 10 0 0 1 2 16Z|0 0 32 32',
        name: 'Wait',
        id: 1,
        nodeType: {
          key: 0,
          value: 'Wait',
        },
        stepType: 'Waiting',
        iconString:
          'M12 8a8 8 0 1 0 0 16h8a8 8 0 1 0 0-16h-8ZM2 16A10 10 0 0 1 12 6h8a10 10 0 0 1 0 20h-8A10 10 0 0 1 2 16Z|0 0 32 32',
        header: 'groupItem',
        type: 'flowNode',
      },
      id: '712bd326-830f-4534-8d84-966b879c58b5',
      position: [456.12890625, 215.375],
      label: '狀況確認',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
    {
      type: 'flowNode',
      stepDefinition: {
        icon: 'M0,0h24v24H0V0z@@fill:none;&&M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z',
        name: 'Stop',
        id: 3,
        nodeType: {
          key: 2,
          value: 'Stop',
        },
        stepType: 'Require',
        iconString:
          'M0,0h24v24H0V0z@@fill:none;&&M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z',
        header: 'groupItem',
        type: 'flowNode',
      },
      id: 'ca249e07-86b7-423b-85c6-ae35eb49b20d',
      position: [462.12890625, 274.625],
      label: '結束點',
      workflowDefinitionId: '1_1_1',
      inputs: {},
      outputs: {},
    },
  ],
  edges: [
    {
      id: '1c1b06dd-797e-40f8-98f3-6acf05d371f3',
      type: 'default',
      data: {},
      label: '',
      markerEnd: 'arrowclosed',
      sourceX: 501.203125,
      sourceY: 183,
      targetX: 501.62890625,
      targetY: 212.375,
      sourceId: '3e72d7f1-69dd-43d8-b6db-95eeeb8f97f1',
      targetId: '712bd326-830f-4534-8d84-966b879c58b5',
    },
    {
      id: 'c7438dc2-c8e1-42af-b2c8-1978a7c3be10',
      type: 'default',
      data: {},
      label: '',
      markerEnd: 'arrowclosed',
      sourceX: 501.62890625,
      sourceY: 240.375,
      targetX: 501.62890625,
      targetY: 271.625,
      sourceId: '712bd326-830f-4534-8d84-966b879c58b5',
      targetId: 'ca249e07-86b7-423b-85c6-ae35eb49b20d',
    },
  ],
  position: [-1312.6896809633881, -396.39907121126294],
  zoom: 3.6756515339162,
};

export const mockWfNodes: wfNode[] = [
  {
    label: '滅火班',
    id: '1',
    header: 'group',
    children: [
      {
        label: '1-10F',
        id: '11',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '111',
            header: 'process',
            children: [],
          },
          {
            label: '副流程圖',
            id: '112',
            header: 'process',
            children: [],
          },
        ],
      },
      {
        label: '10-24F',
        id: '12',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '121',
            header: 'process',
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: '救護班',
    id: '2',
    header: 'group',
    children: [
      {
        label: '1-10F',
        id: '21',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '211',
            header: 'process',
            children: [],
          },
        ],
      },
      {
        label: '11-24F',
        id: '22',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '221',
            header: 'process',
            children: [],
          },
          {
            label: '副流程圖',
            id: '222',
            header: 'process',
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: '安全防護班',
    id: '3',
    header: 'group',
    children: [
      {
        label: '全樓層',
        id: '31',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '311',
            header: 'process',
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: '避難引導班',
    id: '4',
    header: 'group',
    children: [
      {
        label: '1-12F',
        id: '41',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '411',
            header: 'process',
            children: [],
          },
        ],
      },
      {
        label: '13-24F',
        id: '42',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '421',
            header: 'process',
            children: [],
          },
        ],
      },
    ],
  },
  {
    label: '通報班',
    id: '5',
    header: 'group',
    children: [
      {
        label: '全樓層',
        id: '51',
        header: 'marshalling',
        children: [
          {
            label: '主流程圖',
            id: '511',
            header: 'process',
            children: [],
          },
          {
            label: '副流程圖',
            id: '512',
            header: 'process',
            children: [],
          },
        ],
      },
    ],
  },
];
