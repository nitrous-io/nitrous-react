import ajax from 'lib/ajax';

class Token {
  token = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  isPresent() {
    return typeof this.token === "string" && this.token.length > 0;
  }

  fetch(username, password) {
    return ajax({
      type: 'POST',
      url: '/api/v0/oauth/token',
      dataType: 'json',
      data: {
        grant_type: 'password',
        username,
        password
      }
    }).then((data) => {
      this.token = data.access_token;
      localStorage.setItem('token', this.token);
    });
  }

  invalidate() {
    this.token = null;
    localStorage.removeItem('token');
  }

  ajax(options={}) {
    options = Object.assign({}, options);
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${this.token}`;
    return ajax(options);
  }
}

export default new Token();
