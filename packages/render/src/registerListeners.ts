export const registerListeners = () => {
  window.addEventListener('load', function () {
    function applyStyle(id: string, styleDef: string) {
      if (styleDef) {
        const el = document.getElementById(id);
        if (!el) {
          return;
        }
        el.classList.add(styleDef);
      }
    }
    applyStyle('login-bg-image', 'bgStyle');
    applyStyle('login-bg-image-ie8', 'bgStyleIE8');
  });
};
