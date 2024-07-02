
FROM node:20-alpine3.17 as gitpreinstall
WORKDIR /home/node/app

ARG CACHEBUST=1
ARG ssh_prv_key
ARG ssh_pub_key
ARG known_hosts
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh
RUN echo "$known_hosts" > /root/.ssh/known_hosts
RUN echo "$ssh_prv_key"  | tr '|' '\n' > /root/.ssh/id_rsa && \
    echo "$ssh_pub_key" > /root/.ssh/id_rsa.pub && \
    chmod 600 /root/.ssh/id_rsa && \
    chmod 600 /root/.ssh/id_rsa.pub

RUN apk update && apk add --no-cache git openssh
RUN npm config set package-lock false && npm i -g typescript
RUN echo "${CACHEBUST}"
COPY "./package.json" "."
COPY "." .

RUN npm i --no-package-lock --no-audit --production --no-save --verbose

RUN rm -rf /root/.ssh/

RUN ./container.tsc.sh

FROM node:20-alpine3.17
WORKDIR /home/node/app
COPY --from=gitpreinstall /home/node/app /home/node/app

ENTRYPOINT [ "sh" ]