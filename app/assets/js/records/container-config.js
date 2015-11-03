import { Record, List, Map } from 'immutable';

export default class ContainerConfig extends Record({
  cmd: null,
  port: null,
  configPortBindings: null,
  env: null,
  volume: null,
  privileged: false,
  publishAll: false
}) {
  static deserialize(p) {
    return new this({
      cmd: p.cmd,
      port: p.port,
      configPortBindings: p.config_port_bindings,
      env: p.env,
      volume: p.volume,
      privileged: p.privileged,
      publishAll: p.publish_all
    });
  }

  get envMap() {
    return Map(this.env.map((v) => {
      const m = v.match(/^([^=]+)=(.*)$/),
            key = m[1],
            val = m[2];
      return [key, val];
    }));
  }

  get previewPort() {
    return this.envMap.get('NITROUS_PREVIEW_PORT');
  }

  // Actual, "live" port bindings.
  get portBindings() {
    const arr = this.port.map((str) => {
      return PortBinding.parse(str, this.previewPort);
    });
    return List(arr);
  }

  // Configured port bindings. This allows us to tell which bindings have
  // dynamically assigned host ports.
  get configuredPortBindings() {
    const arr = this.configPortBindings.map((str) => {
      return PortBinding.parse(str, this.previewPort);
    });
    return List(arr);
  }
}

export class PortBinding extends Record({
  preview: false,
  public: false,
  hostPort: null,
  containerPort: null,
  tcp: false,
  udp: false
}) {
  static _portBindingRegex = /^(public|private):(\d{0,5}):(\d{1,5})(?:\/(tcp|udp))?$/;

  /*
   * Example binding strings: "public:49153:22/tcp", "private::80/udp".
   */
  static parse(str, previewPort) {
    const matches = this._portBindingRegex.exec(str);
    if (!matches) {
      return null;
    }

    const [, visibility, hostPort, containerPort, protocol] = matches;
    return new this({
      preview: previewPort && previewPort === containerPort,
      public: visibility === 'public',
      hostPort,
      containerPort,
      tcp: protocol === 'tcp',
      udp: protocol === 'udp'
    });
  }

  serialize() {
  }
}
