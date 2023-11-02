(function () {


  const addBeforeHook = (name, hook) => {
    const current = window?.additionalOptions?.hooks ?? {};

    const hooks = {
      ...current,
      [name]: {
        ...current[name],
        before: [...(current[name]?.before || []), hook]
      }
    };

    window.additionalOptions.hooks = hooks;
    // console.log(window.additionalOptions)
  };

  const seen = new Set();    // tracks forms rendered by widget via before hook

  const hasRenderedView = (formName) => {
    console.log(seen);
    return seen.has(formName);
  }

  const sleep = (delay = 500) => () => {
    return new Promise((r) => setTimeout(r, delay));
  }

  const addDelayToForm = (formName, delay = 500) => {
    addBeforeHook(formName, sleep(delay));
  };

  // "exports"
  window.hasRenderedView = hasRenderedView;
  window.addDelayToForm = addDelayToForm;

  // exposed by widget playground
  window.additionalOptions = {};

  window.additionalHooks = [
    ['afterRender', ({ formName }) => seen.add(formName)]
  ];

  // binds "seen view" listener
  addBeforeHook('*', (view) => seen.add(view));
  // adds short delay to `success-redirect` in order to confirm checks before navigating to new page
  addBeforeHook('success-redirect', sleep());
})();
