
# P2P Fetch

`p2p-fetch` catches web requests in-flight (using ServiceWorkers) and stores the responses in a Offline + P2P database for later usage.
No changes are necessary in your website or app to use it. Just include the scripts and you should be good to go.

## Usage

Copy the files in the 'dist' folder to the *root of your site* and include the p2p-fetch.js script in the header of your HTML pages (URL-encoding the configuration parameters as shown below).

```
<script src="p2p-fetch.js?FETCH_PATTERN=(.png)%7C(.jpg)&TIMEOUT=5000&SERVER=gun-server.example.com"></script>
```

The `p2p-fetch` ServiceWorker needs to be installed and activate before it can catch requests, which means that any assets loaded before that happens will still be loaded from the web.

To make sure you don't miss anything delay you asset loading until the `oncontrollerchange` event is triggered:
```
navigator.serviceWorker.addEventListener('controllerchange', function() {
  // asset loading goes here
});
```

Explore the 'examples' folder for a working example.

## Runtime Dependency

You'll need a running GunDB instance to use `p2p-fetch`.
The domain of your GunDB instance should be passed in the SERVER parameter.

## Is it production ready?

No. It's not even ready.

There is no security model in place and anyone and their mother can change the data in the P2P database.
Don't trust `p2p-fetch` for anything other than harmless fun.

## Configuration

 * FETCH_PATTERN: a regular expression that will be used inside the ServiceWorker to identify which assets to catch
 * DB_NAME (default is 'p2p-fetch'): the name of the browser database where the offline data will be stored
 * TIMEOUT (default is 5000): how many miliseconds to wait for the response from the P2P database before going online for the data
 * SERVER: the server supporting the P2P database

## Building

`docker-compose build`
`docker-compose up`

You can find the resulting files in the 'dist' folder.

## Credits, Dependencies, References

 * [GUN - Graph Database](https://github.com/amark/gun)
 * [MDN web docs » Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
 * [Google Developers » Introduction to Service Worker ](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker)
 * [Activate Service Workers Faster](https://davidwalsh.name/service-worker-claim)
 * [WHATWG » Fetch API](https://fetch.spec.whatwg.org/)
 * [MDN web docs » Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
 * [MDN web docs » Response.type](https://developer.mozilla.org/en-US/docs/Web/API/Response/type)
