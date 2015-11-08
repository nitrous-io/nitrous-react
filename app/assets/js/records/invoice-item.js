import { Record } from 'immutable';

export default class InvoiceItem extends Record({
  id: null,
  invoiceId: null,
  hostId: null,
  hostSlug: null,
  hours: null,
  hourlyCents: null,
  totalCharge: null,
  description: null,
  terminated: null,
  itemType: null,
  usage: null
}) {
  static deserialize(i) {
    return new this({
      id: i.id,
      invoiceId: i.invoice_id,
      hostId: i.host_id,
      hostSlug: i.host_slug,
      hours: i.hours,
      hourlyCents: i.hourly_cents,
      totalCharge: i.total_charge,
      description: i.description,
      terminated: i.terminated,
      itemType: i.item_type,
      usage: i.usage
    });
  }
}
