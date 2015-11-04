export default class Notification {
  static _nextId = 0;

  _id = null;
  _content = null;
  _kind = null;

  constructor(content, kind) {
    this._id = this.constructor._nextId ++;
    this._content = content || 'Blank notification';
    this._kind = kind || 'info';
  }

  get id() {
    return this._id;
  }

  get content() {
    return this._content;
  }

  get kind() {
    return this._kind;
  }
}
