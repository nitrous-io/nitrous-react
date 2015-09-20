export default class Notification {
  static notificationId = 0;

  _id = null;
  _content = null;

  constructor(content) {
    this._id = this.constructor.notificationId ++;
    this._content = content || 'Blank notification';
  }

  get id() {
    return this._id;
  }

  get content() {
    return this._content;
  }
}
