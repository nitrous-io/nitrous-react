import { Record, List, Map } from 'immutable';

export default class ContainerConfig extends Record({
  cmd: null,
  port: null,
  configPortBindings: null,
  _env: null, // read-only, use (the more useful) envMap instead
  envMap: null,
  volume: null,
  privileged: false,
  publishAll: false
}) {
  static deserialize(p) {
    return new this({
      cmd: p.cmd,
      port: p.port,
      configPortBindings: p.config_port_bindings,
      _env: p.env,
      envMap: Map(p.env.map((v) => {
        const m = v.match(/^([^=]+)=(.*)$/),
              key = m[1],
              val = m[2];
        return [key, val];
      })),
      volume: p.volume,
      privileged: p.privileged,
      publishAll: p.publish_all
    });
  }

  // Returns a new ContainerConfig record with the given env var set.
  withEnv(key, value) {
    const newMap = this.envMap.set(key, value);
    return this.merge({ envMap: newMap });
  }

  // Returns a new ContainerConfig with the preview port env var set to the
  // given port.
  withPreviewPort(port) {
    return this.withEnv('NITROUS_PREVIEW_PORT', port);
  }

  // Returns a new ContainerConfig with the "editable" port bindings set to the
  // given List of bindings.
  withEditedPortBindings(bindings) {
    const newPortBindings = [];

    this.uneditableConfiguredPortBindings.forEach((binding) => {
      newPortBindings.push(binding.serialize());
    });
    bindings.forEach((binding) => {
      newPortBindings.push(binding.serialize());
    });

    return this.merge({ configPortBindings: newPortBindings });
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

  // Configured port bindings that are editable by users.
  get editableConfiguredPortBindings() {
    let bindings = this.configuredPortBindings.filter((v) => v.editable);
    bindings = bindings.sort((a, b) => {
      const aInt = parseInt(a.containerPort, 10),
            bInt = parseInt(b.containerPort, 10);
      return aInt - bInt;
    });
    return bindings;
  }

  // Configured port bindings that are NOT editable by users. This +
  // editableConfiguredPortBindings == configuredPortBindings.
  get uneditableConfiguredPortBindings() {
    return this.configuredPortBindings.filter((v) => !v.editable);
  }

  toFormData() {
    const { volume, configPortBindings, privileged, publishAll } = this;
    return {
      env: this.envMapToArray(),
      volume,
      port: configPortBindings.toArray(),
      privileged,
      publish_all: publishAll
    };
  }

  envMapToArray() {
    const arr = [];
    this.envMap.forEach((value, key) => {
      arr.push(`${key}=${value}`);
    });
    return arr;
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
      hostPort: hostPort || null,
      containerPort: containerPort || null,
      tcp: protocol === 'tcp',
      udp: protocol === 'udp'
    });
  }

  // We only want users to edit port bindings that are:
  //  1. public,
  //  2. TCP,
  //  3. container port is not the SSH port (i.e. port 22).
  get editable() {
    return this.public && this.tcp && this.containerPort !== '22';
  }

  get protocol() {
    if (this.tcp) {
      return 'tcp';
    }
    return 'udp';
  }

  serialize() {
    return `${this.public ? 'public': 'private'}:${this.hostPort || ''}:${this.containerPort}/${this.protocol}`;
  }
}
