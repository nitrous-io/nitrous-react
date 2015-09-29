# Nitrous:next

### Setup

1. Install iojs v3.3.0 (jsdom only supports iojs atm)

```
nvm install iojs-v3.3.0
nvm alias default iojs-v3.3.0
```

2. Install dependencies

```
npm install
```

3. Add the following to your `.{z,ba}shrc`:

```
# prefer locally installed node module binaries
export PATH="node_modules/.bin:$PATH"
```

4. Add the following to your nginx config (`/etc/nginx/sites-enabled/default`) to forward all API requests to nitrousd:

```
server {
  listen 9010 ssl default_server;

  ssl_certificate /etc/nginx/certs/n2odev.crt;
  ssl_certificate_key /etc/nginx/certs/n2odev.key;

  server_name pro.n2odev.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
  }

  location /api/v0/ {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

### Development

Run `gulp` to start a dev server and watch file system changes. ESLint is run automatically when the code is rebuilt. Please fix all lint issues before committing.

Run `npm test` to run Jest tests.

- - -
Copyright (c) 2015 Nitrous, Inc. All Rights Reserved.
