FROM node:10

ARG mode

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

ENV PORT 80

ENV NODE_ENV ${mode}

EXPOSE 80

RUN echo $NODE_ENV


CMD ["sh", "-c", "npm run start:$NODE_ENV"]
