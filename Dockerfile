FROM node:9-alpine as base

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install graphql
RUN npm install

COPY . /app
EXPOSE 4000
ENV APP_NAME type-graphql-proj
ENTRYPOINT [ "npm" ] 
CMD ["start"]