export default class SocketConnection {
  url = undefined;
  shouldRetry = true;
  heartbeatTimeout = 30000;

  _ws = null;
  _protocols = undefined;
  _retries = 0;
  _retryTimeout = null;
  _heartbeatTimer = null;

  constructor(url, protocols) {
    this.url = url;
    this._protocols = protocols;
    this._retries = 0;
  }

  open(nobeforeopen) {
    if (this._ws) {
      this.close();
    }

    if (!nobeforeopen) {
      this.onbeforeopen();
    }

    if (!this.url) {
      this._ws = null;
      return;
    }

    this._heartbeat();

    let ws;
    if (this._protocols) {
      ws = new WebSocket(this.url, this._protocols);
    } else {
      ws = new WebSocket(this.url);
    }
    this._ws = ws;

    ws.onopen = (evt) => this.onopen(evt);
    ws.onclose = (evt) => this.onclose(evt);
    ws.onerror = (evt) => this.onerror(evt);
    ws.onmessage = (evt) => {
      if (evt.data === 'h') {
        this._heartbeat();
      }
      this.onmessage(evt);
    };

    ws._onopen = () => {
      this._retries = 0;
      this._heartbeat();
    };

    ws._onclose = () => {
      ws.removeEventListener('open', ws._onopen,  false);
      ws.removeEventListener('close', ws._onclose, false);
      window.clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
      if (this.shouldRetry && !ws._noRetry) {
        this.retry();
      }
    };

    ws.addEventListener('open', ws._onopen,  false);
    ws.addEventListener('close', ws._onclose, false);
  }

  _heartbeat() {
    window.clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = window.setInterval(() => {
      this.close(true);
    }, this.heartbeatTimeout);
    this.send('h');
  }

  retry() {
    let delay = 0;
    if (this._retries <= 5) {
      delay = 2000;
    } else if (this._retries <= 10) {
      delay = 3000;
    } else if (this._retries > 10) {
      delay = 5000;
    }
    window.clearTimeout(this._retryTimeout);
    this._retryTimeout = window.setTimeout(() => {
      this.open();
    }, delay);
    this._retries += 1;
  }

  send(data) {
    try {
      if (this._ws && this.readyState === WebSocket.OPEN) {
        this._ws.send(data);
      }
    } catch (e) {}
  }

  close(retry=false) {
    if (this._ws) {
      this._ws._noRetry = !retry;
      this._ws.close();
    }
  }

  onbeforeopen() {}
  onopen() {}
  onclose() {}
  onmessage() {}
  onerror() {}

  get binaryType() {
    if (this._ws) {
      return this._ws.binaryType;
    }
  }

  get bufferedAmount() {
    if (this._ws) {
      return this._ws.bufferedAmount;
    }
  }

  get extensions() {
    if (this._ws) {
      return this._ws.extensions;
    }
  }

  get protocol() {
    if (this._ws) {
      return this._ws.protocol;
    }
  }

  get readyState() {
    if (this._ws) {
      return this._ws.readyState;
    }
  }
}
