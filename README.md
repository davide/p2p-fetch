
# P2P Fetch

`p2p-fetch` catches web requests in-flight (using ServiceWorkers) and stores the responses in a Offline + P2P database for later usage.
No changes are necessary in your website or app to use it. Just include the scripts and you should be good to go.

## Usage

* Copy the files in the 'dist' folder to the *root of your site*

* Include the p2p-fetch.js script in the header of your HTML pages
```
<script type="text/javascript" src="p2p-fetch.js></script>
```

* Configure and wait for `p2p-fetch` to be ready before loading your assets (otherwise they won't be caught)


To make sure you don't miss anything delay your assets until you get the 'p2p-fetch-ready' event:
```
p2pFetch({
        'FETCH_PATTERN': '(.png)|(.jpg)',
        'TIMEOUT': 5000,
        'SERVER': 'https://gun-server-example.com/gun'
      }).then(function(){
          // asset loading goes here
      });
```

Explore the 'examples' folder for a working example.

## Runtime Dependency

You'll need a running GunDB *server* instance to use `p2p-fetch`.
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
 * FORCE_P2P: (default is '') debug variable *read from the URL search parameters* that forces `p2p-fetch` to operate only with p2p data
 * LOG_LEVEL: (default is 0, highest value is 4) debug variable *read from the URL search parameters* that controls the logging of the `p2p-fetch` underlying activities. 

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
 * [The Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
 * [Stuff I wish I'd known sooner about service workers](https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9)
 * [How to really get ALL fetch requests captured by your Service Worker](https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9#gistcomment-2737157)
 * [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage)
