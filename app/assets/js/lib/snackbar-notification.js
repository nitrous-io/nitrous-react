export default class Notification {
  static notificationId = 0;

  _id = null;
  content = null;

  constructor(content) {
    this._id = this.constructor.notificationId ++;
    this.content = content || 'Blank notification';
  }

  get id() {
    return this._id;
  }
}