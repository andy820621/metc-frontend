import { boot } from 'quasar/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { Notify, Cookies } from 'quasar';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
function tip(msg: string) {
  Notify.create({
    type: 'negative',
    message: msg,
    position: 'top',
  });
}
const service = axios.create({
  baseURL: process.env.API,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8;',
  },
});

// axios 攔截器
service.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers.Authorization = 'Bearer ' + accessToken;
    }
    return config;
  },
  (error) => {
    console.log('error', error); // for debug
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    error.globalErrorProcess = function () {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (window.location.pathname === '/login') break;
            tip(`錯誤代碼: ${this.response.status}，請聯絡水星人員`);
            break;
          case 401: // 處理基本 401 錯誤
            tip('登入過期，請重新登入');
            // location.reload(); // 強迫重刷以清除 pinia 狀態跟 axios header 設置
            break;
          case 403: // 處理基本 403 錯誤
            tip('權限不足');
            break;
          case 404: // 處理基本 404 錯誤
            // tip(error.response.data.error);
            console.log('req未攔截到的錯誤:', error.response);
            break;
          case 423:
            tip('請勿刪除正在使用之設定');
            break;
          case 500:
            tip('500 : 系統出現錯誤，請洽系統管理員');
            break;
          default:
            console.log('req未攔截到的錯誤:', error.response);
          // 處理其他4xx/5xx等基本錯誤的處理
        }
      }
      if (!window.navigator.onLine) {
        alert('網路出了點問題，請重新連線後重整網頁');
        return;
      }
      return Promise.reject(
        new Error(this instanceof Error ? this.message : String(this)),
      );
    };

    // eslint-disable-next-line no-prototype-builtins
    if (error.config.hasOwnProperty('catch') && error.config.catch) {
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
    return error.globalErrorProcess();
  },
);

const req = <T>(
  method: string,
  url: string,
  data: unknown = null,
): Promise<T> => {
  url = '/api' + url;
  // console.log('method:'+method+' || url:'+url+' || data:'+JSON.stringify(data)+' || isUpload:'+isUpload)
  // method = method.toLowerCase();
  if (method === 'post') {
    // var search = url.indexOf("/ss");
    // if (search > 0 && isOrderby) {
    // data.orderBy = "id desc";
    // }
    // if (!Array.isArray(data) && data && parentId !== null) {
    //   data.parentId = parentId;
    // }
    console.log(
      'method:' +
        method +
        ' || url:' +
        url +
        ' || data:' +
        JSON.stringify(data),
    );
    if (data) return service.post(url, data);
    return service.post(url);
  } else if (method === 'uploadPatch') {
    console.log(
      'method:uploadPatch || url:' + url + ' || data:' + JSON.stringify(data),
    );
    return service.request({
      url,
      method: 'patch',
      headers: { 'Content-Type': 'multipart/form-data' },
      data,
    });
  } else if (method === 'uploadPost') {
    console.log(
      'method:uploadPost || url:' + url + ' || data:' + JSON.stringify(data),
    );
    return service.request({
      url,
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data,
    });
  } else if (method === 'get') {
    if (data) {
      let str = '';
      Object.entries(data as object).forEach(function ([key, value], index) {
        if (index === 0) str += `${key}=${value}`;
        else str += `&${key}=${value}`;
      });
      console.log(
        'method:' +
          method +
          ' || url:' +
          `${url}?${str}` +
          ' || data:' +
          JSON.stringify(data),
      );
      return service.get(`${url}?${str}`);
    } else {
      console.log(
        'method:' +
          method +
          ' || url:' +
          url +
          ' || data:' +
          JSON.stringify(data),
      );
      return service.get(url);
    }
  } else if (method === 'files') {
    console.log(
      'method:' +
        method +
        ' || url:' +
        url +
        ' || data:' +
        JSON.stringify(data),
    );
    return service.request({
      url,
      method: 'get',
      responseType: 'arraybuffer',
    });
  } else if (method === 'delete') {
    console.log(
      'method:' +
        method +
        ' || url:' +
        url +
        ' || data:' +
        JSON.stringify(data),
    );
    if (data === null) {
      return service.delete(url);
    } else {
      return service.request({
        url,
        method: 'delete',
        headers: { 'Content-Type': 'application/json;charset=UTF-8;' },
        data,
      });
    }
  } else if (method === 'put') {
    // if (!Array.isArray(data) && data && parentId !== null) {
    //   data.parentId = parentId;
    // }
    console.log(
      'method:' +
        method +
        ' || url:' +
        url +
        ' || data:' +
        JSON.stringify(data),
    );
    return service.request({
      url,
      method: 'put',
      headers: { 'Content-Type': 'application/json;charset=UTF-8;' },
      data,
    });
  } else if (method === 'patch') {
    // if (!Array.isArray(data) && data && parentId !== null) {
    //   data.parentId = parentId;
    // }
    console.log(
      'method:' +
        method +
        ' || url:' +
        url +
        ' || data:' +
        JSON.stringify(data),
    );
    return service.patch(url, data);
  } else {
    console.error('未知的method:' + method);
    return Promise.reject(new Error('未知的method:' + method));
  }
};

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$req = req;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axios, req };
