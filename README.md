# You Smile You Lose

Open your camera, we show you funny videos. If you smile, you lose !

https://www.smile-lose.com/

# Install

```
npm install
```

# Configuration

## SSL

In order for the models to be load and the camera to work in local, you'll need to install a self-signed certificate.

```
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

Full explanation here : https://hackernoon.com/set-up-ssl-in-nodejs-and-express-using-openssl-f2529eab5bb

When a passphrase is asked just type : **default**

## Loading model URL

In local you need to adjust the configuration of your URL for the models to load normaly : see **loadModels function** in **libs/app.js**

# Launch

DEV

```
npm run-script start-dev
```

PROD

```
npm start
```