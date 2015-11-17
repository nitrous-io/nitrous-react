# Nitrous:next

### Setup

1. Install NodeJS

```
nvm install v4.2.1
nvm alias default v4.2.1
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

  server_name www.n2odev.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
  }

  location /api/v0/ {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }

  location /ide/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

### Development

Run `gulp` to start a dev server and watch file system changes. ESLint is run automatically when the code is rebuilt. Please fix all lint issues before committing.

Run `npm test` to run Jest tests.

#### Analyzing file size

Using [disc](https://github.com/hughsk/disc) you can analyze the resulting `app.js`. To analyze the file you will need to run the following:

```
gulp clean && FULL_PATHS=true gulp js-dist
discify build/dist/assets/js/app.js > info-dist.html
```

`discify` requires browserify generate the app.js with full paths, so you need to pass in `FULL_PATHS=yes` as an environment variable.
The file `info-dist.html` should be generated which you can then look at in your browser for a full breakdown of the `app.js`.

#### LiveReload support

[LiveReload](http://livereload.com/) is supported. To get this to work:

1. Install a [LiveReload extension for your browser](http://livereload.com/extensions/).
2. Assuming you're using Nitrous, you'll need to be able to access port 35729
of your container locally. You can do this by forwarding port 35729 or by
opening port 35729 on your container.
3. Your browser will probably block access to the LiveReload server with a mixed
content warning (i.e. trying to load a http:// URI from a https:// page). To get
around this in Google Chrome, click the shield icon in the address bar.

#### Design

If you are ever lost trying to design something, take a look at Max's draft designs in https://www.dropbox.com/sh/mfa193ha0s4a9ph/AACrVGKiWS_W5s7_9sVj_N7Ba?dl=0. And [React-Bootstrap](http://react-bootstrap.github.io/components.html) has some useful components that come with default styling.

- - -
Copyright (c) 2015 Nitrous, Inc. All Rights Reserved.
