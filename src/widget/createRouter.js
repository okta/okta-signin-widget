import { $ } from 'okta';
import Enums from 'util/Enums';

export default function createRouter (Router, widgetOptions, renderOptions, authClient, successFn, errorFn) {
  let router;
  let routerOptions;
  const promise = new Promise((resolve, reject) => {
    routerOptions = $.extend(true, {}, widgetOptions, renderOptions, {
      authClient,
      globalSuccessFn: (res) => {
        successFn && successFn(res); // call success function if provided
        if (res.status === Enums.SUCCESS) {
          resolve(res);
        }
      },
      globalErrorFn: (error) => {
        errorFn && errorFn(error); // call error function if provided
        reject(error);
      }
    });

    router = new Router(routerOptions);
    router.start();
  });
  return {
    router,
    routerOptions,
    promise
  };
}

