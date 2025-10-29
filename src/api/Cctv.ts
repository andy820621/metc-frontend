import { req } from "boot/axios";
import type { ApiResponse } from "./api.type";

export enum RTCSdpType {
  "answer",
  "offer",
  "pranswer",
  "rollback",
}

export interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex: number;
  usernameFragment?: string;
}

const Cctv = {
  // 取得 offer
  apiGetOffer(uid: string, deviceId: number) {
    return req<ApiResponse<RTCSessionDescriptionInit>>(
      "get",
      `/Camera/getoffer?key=${uid}&deviceId=${deviceId}`
    );
  },
  // 將本地描述 (answer) 傳送到遠端伺服器
  apiSetAnswer(uid: string, payload: RTCSessionDescriptionInit) {
    return req("post", `/Camera/setanswer?key=${uid}`, payload);
  },
  // 將候選人 (answer) 傳送給遠端伺服器
  apiAddIceCandidate(uid: string, payload: RTCIceCandidateInit) {
    return req("post", `/Camera/addicecandidate?key=${uid}`, payload);
  },
};

export default Cctv;
