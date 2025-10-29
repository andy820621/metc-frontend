import type { WorkflowTypeViewModel } from './../../../api/workflowType';
import { NodeProps } from '@vue-flow/core';

export interface wfNode {
  label: string;
  id: number | string;
  icon?: string;
  header?: string;
  children?: wfNode[];
}
export interface myGraphEdge {
  type: string;
  source: string;
  target: string;
  data: object;
  events: object;
  label?: string;
  id: string;
  markerEnd: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}
export interface stepDefinition {
  id: number;
  name: string;
  isStart: boolean;
  nodeType: {
    key: number;
    value: string;
  };
  icon: string;
  stepType: string;
  type: string;
}
export interface convertedNode {
  type: string;
  data?: {
    stepDefinition?: stepDefinition;
  };
  stepDefinition?: stepDefinition;
  id: string;
  position: [number, number];
  label: string;
  roleName?: string;
  message?: string;
  workflowDefinitionId: string;
  version: number;
  inputs: object;
  outputs: object;
}

export interface serverDataType {
  id: string;
  version: number;
  groupId: number;
  buildingId: number;
  description: string;
  nodes?: convertedNode[];
  edges?: object[];
  position?: [number, number];
  zoom?: number;
  type: WorkflowTypeViewModel;
}
