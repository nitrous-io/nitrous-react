import EventedSocket from 'lib/evented-socket';

class PingerSocket {
  _socket = null;
  _host = null;
  _requestId = null;

  constructor(data) {
    const { host, token, requestId } = data;
    this._host = host;
    this._token = token;
    this._requestId = requestId;
  }

  connect = () => {
    const origin = `${location.protocol.replace('http', 'ws')}//${location.host}`,
          url = `${origin}/api/v0/hosts/${this._host.id}/activity?token=${this._token}`;

    this._socket = new EventedSocket(url);
    this._socket.connect(true);
  }

  disconnect = () => {
    if (this._socket) {
      this._socket.disconnect();
    }
  }

  ping = () => {
    this._socket.send(`active|${Date.now()}`);
  }
}

export default PingerSocket;
