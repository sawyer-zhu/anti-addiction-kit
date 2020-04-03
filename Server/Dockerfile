FROM node:11

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir -p /var/www/xdsdk-server

WORKDIR /var/www/xdsdk-server

# add npm package
COPY package.json /var/www/xdsdk-server/package.json

RUN npm i

# copy code
COPY . /var/www/xdsdk-server

EXPOSE 7001

CMD npm start