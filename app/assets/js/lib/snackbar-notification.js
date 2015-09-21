export default class Notification {
  static _nextId = 0;

  _id = null;
  _content = null;

  constructor(content) {
    this._id = this.constructor._nextId ++;
    this._content = content || 'Blank notification';
  }

  get id() {
    return this._id;
  }

  get content() {
    return this._content;
  }
}
