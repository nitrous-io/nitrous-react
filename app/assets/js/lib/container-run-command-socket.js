import EventedSocket from 'lib/evented-socket';
import dispatcher from 'app-dispatcher';
import $ from 'jquery';

class ContainerRunCommandSocket {
  _socket = null;
  _token = null;
  _requestId = null;

  constructor(token, requestId) {
    this._token = token;
    this._requestId = requestId;
  }

  connect(host, container, command, timeout) {
    const params = $.param({ token: this._token, command, timeout, binary: false }),
          origin = location.protocol.replace('http', 'ws') + "//" + host.freighterProxyUrl,
          url = `${origin}/containers/${container.cid}/run_command?${params}`;

    this._socket = new EventedSocket(url);
    this._socket.on('message', this.handleMessage);
    this._socket.on('close', this.handleClose);
    this._socket.connect(false);
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
    }
  }

  handleClose = (ev) => {
    // 1006 indicate that a connection was closed abnormally
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (ev.code === 1006) {
      this._socket.disconnect();
      dispatcher.dispatch({
        type: 'run_command_failed',
        msg: 'connection closed',
        requestId: this._requestId
      });
    }
  }

  handleMessage = (message) => {
    if (message.indexOf('d|') > -1) {
      if (message.indexOf('Exit status:') > -1) {
        const statuses = message.match(/Exit status: (\d+)/);
        if (statuses[1] !== '0') {
          this.disconnect();
          dispatcher.dispatch({
            type: 'run_command_failed',
            msg: statuses[1],
            requestId: this._requestId
          });
          return;
        }
      }
      if (message.indexOf('Run command done.') > -1 ||
          message.indexOf('Repository cloned.') > -1) {
        this.disconnect();
        const msg = message.replace('d|', '');
        dispatcher.dispatch({
          type: 'ran_command',
          msg,
          requestId: this._requestId
        });
        return;
      }
      const msg = message.replace('d|', '');
      dispatcher.dispatch({
        type: 'running_command',
        msg,
        requestId: this._requestId
      });
    }
  }
}

export default ContainerRunCommandSocket;
