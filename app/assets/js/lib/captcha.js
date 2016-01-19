class Captcha {
  _siteKey = null

  constructor() {
  }

  init(siteKey) {
    this._siteKey = siteKey;
  }

  setHandlerForTokenChange(handler) {
    window.onCaptchaChange = handler;
  }

  onTokenChange() {
    if (!window.onCaptchaChange) {
      return {};
    }

    return window.onCaptchaChange;
  }

  get siteKey() {
    return this._siteKey;
  }
}

export default new Captcha();
