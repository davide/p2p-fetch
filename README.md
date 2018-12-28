
# P2P Fetch

`p2p-fetch` catches web requests in-flight (using ServiceWorkers) and stores the responses in a Offline + P2P database for later usage.
No changes are necessary in your website or app to use it. Just include the scripts and you should be good to go.

## Usage

Copy the files in the 'dist' folder to the root of your site and include the p2p-fetch.js script in the header of your HTML pages (URL-encoding the configuration parameters as shown below).

`
<script src="p2p-fetch.js?FETCH_PATTERN=(.png)%7C(.jpg)&TIMEOUT=5000&SERVER=gun-server.example.com"></script>
`

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
