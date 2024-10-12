import { router } from "src/router/index";
import { tempDataType } from "./tableMixin";

export interface Params {
  type?: string;
  search?: string;
  label?: string;
  value?: string;
}

export function extractParams(url: string): Params {
  const regex = /(?:\?|&)([^&=]+)=([^&]+)/g;
  const params: Params = {};
  let match;
  while ((match = regex.exec(url)) !== null) {
    params[match[1] as keyof Params] = decodeURIComponent(match[2]);
  }
  return params;
}

export function linkUrlAction(
  tempData: tempDataType,
  linkUrl: string,
  configName?: string
) {
  if (linkUrl !== "onlyOpen") {
    tempData.linkUrl = linkUrl;
  }
  const URL = tempData.linkUrl.match(/^\/([^?]+)/)[0];

  const params: Params = extractParams(tempData.linkUrl);
  const { type, search, label, value } = params;

  if (search) {
    const query = {
      label,
      value,
      type,
      search: configName ? tempData[configName][search] : tempData[search],
    };
    router.push({ path: URL, query });
  }
}
