FROM node:alpine

WORKDIR /app

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache alpine-sdk python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

EXPOSE 3000
ENV NODE_ENV production
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "dev" ]
