import EventedSocket from 'lib/evented-socket';
import dispatcher from 'app-dispatcher';
import $ from 'jquery';

class ContainerRunCommandSocket {
  _socket = null;
  _token = null;

  constructor(token) {
    this._token = token;
  }

  connect(host, container, command, timeout) {
    dispatcher.dispatch({
      type: 'run_command'
    });
    const params = $.param({ token: this._token, command, timeout, binary: false }),
          origin = location.protocol.replace('http', 'ws') + "//" + host.freighterProxyUrl,
          url = `${origin}/containers/${container.cid}/run_command?${params}`;

    this._socket = new EventedSocket(url);
    this._socket.on('message', this.handleMessage);
    this._socket.connect();
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
    }
  }

  handleMessage(message) {
    if (message.indexOf('d|') > -1) {
      if (message.indexOf('d|Run command done.') > -1) {
        this.disconnect();
        dispatcher.dispatch({
          type: "ran_command"
        });
        return;
      }
      const msg = message.replace('d|', '');
      dispatcher.dispatch({
        type: "running_command",
        data: msg
      });
    }
  }
}

export default ContainerRunCommandSocket;
