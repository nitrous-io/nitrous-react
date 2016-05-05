import { Record } from 'immutable';

export default class CustomDomain extends Record({
  id: null,
  containerId: null,
  domain: null,
  port: null,
  containerPort: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      containerId: p.container_id,
      domain: p.domain,
      port: p.port,
      containerPort: p.container_port,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }
}
