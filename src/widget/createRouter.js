import { $ } from 'okta';

export default function createRouter (Router, widgetOptions, renderOptions, authClient, successFn, errorFn) {
  let router;
  let routerOptions;
  const promise = new Promise((resolve, reject) => {
    routerOptions = $.extend(true, {}, widgetOptions, renderOptions, {
      authClient,
      globalSuccessFn: (res) => {
        successFn && successFn(res); // call success function if provided
        resolve(res);
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

