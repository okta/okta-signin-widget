import { registerListeners } from './registerListeners';

describe('registerListeners', () => {
  beforeEach(() => {
    // simple dom cleanup
    document.body.innerHTML = '';
  });

  it('adds classes to login bg image', () => {
    document.body.innerHTML = `
      <div id="login-bg-image"></div>
      <div id="login-bg-image-ie8"></div>
    `;

    registerListeners();
    window.dispatchEvent(new Event('load'));

    const loginBgImageEl = document.getElementById('login-bg-image');
    const loginBgImageIE8El = document.getElementById('login-bg-image-ie8');
    expect(loginBgImageEl?.classList).toContain('bgStyle');
    expect(loginBgImageIE8El?.classList).toContain('bgStyleIE8');
  });

});
