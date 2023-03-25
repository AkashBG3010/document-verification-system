FROM python:3.10-alpine

WORKDIR /app

COPY requirements.txt /app

RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add --no-cache mariadb-dev

RUN apk add gcc musl-dev python3-dev libffi-dev openssl-dev

RUN pip3 install mysqlclient

RUN pip3 install -r requirements.txt

COPY . /app

EXPOSE 80