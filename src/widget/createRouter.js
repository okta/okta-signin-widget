import { $ } from '@okta/courage';
import Enums from 'util/Enums';

export default function createRouter(Router, widgetOptions, renderOptions, authClient, successFn, errorFn, hooks) {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  const routerOptions = $.extend(true, {}, widgetOptions, renderOptions, {
    authClient,
    hooks,
    globalSuccessFn: (res) => {
      successFn && successFn(res); // call success function if provided
      if (res && res.status === Enums.SUCCESS) {
        resolve(res);
      }
    },
    globalErrorFn: (error) => {
      errorFn && errorFn(error); // call error function if provided
      reject(error);
    }
  });
  const router = new Router(routerOptions);
  router.start();
  return {
    router,
    routerOptions,
    promise
  };
}

