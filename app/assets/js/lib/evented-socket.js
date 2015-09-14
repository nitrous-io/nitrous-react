import SocketConnection from 'lib/socket-connection';
import { EventEmitter } from 'events';

export default class EventedSocket extends EventEmitter {
  _conn = null;
  _connected = false;
  url = null;

  constructor(url) {
    super();
    this.url = url;
    const conn = this._conn = new SocketConnection();

    conn.onbeforeopen = () => this.willOpen();
    conn.onopen = (ev) => this.didOpen(ev);
    conn.onmessage = (ev) => this.didReceiveMessage(ev);
    conn.onerror = (ev) => this.didFail(ev);
    conn.onclose = (ev) => this.didClose(ev);
  }

  connect(nobeforeopen) {
    this._conn.url = this.url;
    this._conn.open(nobeforeopen);
  }

  disconnect() {
    if (this._conn) {
      this._conn.close();
    }
  }

  retry() {
    if (this._conn) {
      this._conn.retry();
    }
  }

  dispose() {
    this._conn = undefined;
  }

  send(data) {
    if (this._conn) {
      this._conn.send(data);
    }
  }

  get connected() {
    return this._connected;
  }

  willOpen(ev) {
    this._conn.url = this.url;
    this.emit('beforeopen', ev);
  }

  didOpen(ev) {
    this._connected = true;
    this.emit('open', ev);
  }

  didReceiveMessage(ev) {
    this.emit('message', ev.data);
  }

  didFail(ev) {
    this._connected = false;
    this.emit('error', ev);
  }

  didClose(ev) {
    this._connected = false;
    this._conn.url = null;
    this.emit('close', ev);
  }
}
