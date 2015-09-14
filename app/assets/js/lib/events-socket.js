import EventedSocket from 'lib/evented-socket';
import dispatcher from 'app-dispatcher';

class EventsSocket {
  _socket = null;

  connect(token) {
    const origin = location.protocol.replace('http', 'ws') + "//" + location.host,
          url = `${origin}/api/v0/events?token=${token}`;

    this._socket = new EventedSocket(url);
    this._socket.on('message', this.handleMessage);
    this._socket.connect();
  }

  disconnect() {
    if (this._socket) {
      this._socket.close();
    }
  }

  get connected() {
    if (this._socket) {
      return this._socket.connected;
    }
    return false;
  }

  handleMessage(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      return;
    }

    const event = `events:${msg.name.replace(/_/g, '-')}`,
          data = msg.data;

    console.log(event, data);

    dispatcher.dispatch({
      type: event,
      data
    });
  }
}

export default new EventsSocket();
