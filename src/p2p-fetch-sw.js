
function getQueryParam(key, defaultValue) {
  var values = self.location.search.substring(1).split('&');
  for(var i in values) {
    var pair = values[i].split('=');
    if (decodeURIComponent(pair[0]) == key) {
      return decodeURIComponent(pair[1]) || defaultValue;
    }
  }
  return defaultValue;
}

self.GUN_SERVER = getQueryParam('GUN_SERVER', false);
self.GUN_DB_NAME = getQueryParam('GUN_DB_NAME', 'gun-db');
self.GUN_WAIT_TIME = parseInt( getQueryParam('GUN_WAIT_TIME', '1000') );
self.URL_MATCH_REGEX = new RegExp( getQueryParam('URL_MATCH_REGEX', false) );
self.FORCE_P2P = getQueryParam('FORCE_P2P', '');

if (!self.GUN_SERVER) {
  console.log('Missing parameter in service worker: "gun-server"');
  return;
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  return self.clients.claim();
});

Gun = require('gun/gun');
require('gun/lib/store');
require('gun/lib/rindexed');
//require('gun/lib/not');

self.connect = new Promise(function(resolve){
  console.log('Connecting to gun-db server...')
  var gun = new Gun({
    peers: [ self.GUN_SERVER ],
    localStorage: false,
    indexedDB: indexedDB,
    file: self.GUN_DB_NAME
  });
  console.log('Connecting to gun-db server... setup timeout.')
  setTimeout(function(){
    resolve(gun);
  }, 4000);
  gun.on('hi', function(peer){
    console.log('Connected to gun-db server!', peer);
    resolve(gun)
  });
  gun.on('bye', function(peer){
    console.log('Disconnected from gun-db server!', peer);
  });

});

// https://stackoverflow.com/a/16245768
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


function dataURLToBlob(dataUrl) {
  var split1 = dataUrl.indexOf(';'),
      split2 = dataUrl.indexOf(',') + 1,
      contentType = dataUrl.substring(5, split1),
      b64Data = dataUrl.substr(split2);
  return b64toBlob(b64Data, contentType);
}


// approach taken from: http://craig-russell.co.uk/2016/01/26/modifying-service-worker-responses.html
self.addEventListener('fetch', function(event) {
  // https://stackoverflow.com/a/49719964 -- temporary fix
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  var url = event.request.url;
  if (url.match('/p2p-fetch(-sw)?\.js') || !url.match(self.URL_MATCH_REGEX)) {
    event.respondWith(fetch(event.request));
    return;
  }

  console.log('gun.get(encodeURI("' + url + '"))');

  event.respondWith(
    new Promise(function(resolve){

    self.connect.then(function(gun){

        var p2pTimeout = (self.FORCE_P2P != '') ? 9999999 : self.GUN_WAIT_TIME;

        // applying a user-defined timeout (see https://gun.eco/docs/API#once)
        gun.get(encodeURI(url)).once(function(dataForUrl){
          if (dataForUrl) {
            console.log('Got P2P data!')
            var init = JSON.parse(dataForUrl.init_json || '{}'),
                bodyDataUrl = dataForUrl.body_data_url;
            console.log('url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70));
            var blob = dataURLToBlob(bodyDataUrl);
            return resolve(
              new Response(blob, init)
            );
          }

          console.log('No data found. Off to the internets to get: ', url);
          fetch(event.request, {mode: "cors", credentials: "same-origin"}).then(function(response){
            var r = response.clone();            
            var init = {
              status:     r.status,
              statusText: r.statusText,
              headers: {
                "content-type": r.headers["content-type"] || r.headers["Content-Type"],
                "content-length": r.headers["content-length"] || r.headers["Content-Length"],
                "etag": r.headers["etag"] || r.headers["Etag"],
                "last-modified": r.headers["last-modified"] || r.headers["Last-Modified"]
              }
            };
            //r.headers.forEach(function(v,k){ init.headers[k] = v; });
            return r.arrayBuffer().then(function(bodyArrayBuffer){
              console.log('The internets have spoken. P2P storage, engage!');
              var contentType = init.headers['content-type'] || init.headers['Content-Type'];
              var blob = new Blob([bodyArrayBuffer], {type : contentType});
              if (blob.size == 0) {
                console.log('Crap! Can\'t reach the data to store it!');
                return resolve(response);
              }
              var reader = new FileReader();
              reader.readAsDataURL(blob); 
              reader.onloadend = function() {
                var bodyDataUrl = reader.result;
                gun.get(encodeURI(url)).put({
                  init_json: JSON.stringify(init),
                  body_data_url: bodyDataUrl
                }, function(ack){
                  console.log('url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70));
                  var blob = dataURLToBlob(bodyDataUrl);
                  resolve(
                    new Response(blob, init)
                  );
                });
              };
            });

          }); // fetch

        }, {wait: p2pTimeout}); // gun get

      }); // connect.then


    }) // Promise
  ); // event.respondWith

});
