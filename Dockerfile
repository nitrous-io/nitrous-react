FROM node:4.4.3

MAINTAINER eng@nitrous.io

# Adding go
ENV GO_VERSION 1.5.1
ENV PATH /usr/local/go/bin:$PATH

RUN curl -s https://storage.googleapis.com/golang/go$GO_VERSION.linux-amd64.tar.gz | tar -xvz -C /usr/local


# Caching node_modules in the container generation
RUN mkdir -p /tmp/nitrous-react-builder
ADD package.json /tmp/nitrous-react-builder/

RUN cd /tmp/nitrous-react-builder && npm install --quiet

RUN mkdir -p /opt/nitrous/nitrous-react
RUN cp -r /tmp/nitrous-react-builder/node_modules /opt/nitrous/nitrous-react/

ADD . /opt/nitrous/nitrous-react

WORKDIR /opt/nitrous/nitrous-react
