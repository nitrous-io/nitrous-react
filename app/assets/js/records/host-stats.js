import { Record } from 'immutable';

export default class HostStats extends Record({
  memoryTotal: null,
  memoryUsage: null,
  numCPU: null,
  perCPUUsage: null,
  storageTotal: null,
  storageUsage: null,
  inodeTotal: null,
  inodeUsage: null,
  uptime: null
}) {
  static deserialize(p) {
    return new this({
      memoryTotal: p.memory_total,
      memoryUsage: p.memory_usage,
      numCPU: p.num_cpu,
      perCPUUsage: p.per_cpu_usage,
      storageTotal: p.storage_total,
      storageUsage: p.storage_usage,
      inodeTotal: p.inode_total > 0 ? p.inode_total : null,
      inodeUsage: p.inode_usage > 0 ? p.inode_usage : null,
      uptime: p.uptime
    });
  }
}
