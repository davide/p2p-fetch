
Gun = require('gun/gun');
require('gun/lib/store');
require('gun/lib/rindexed');

self.options = { LOG_LEVEL: 0 };

function debug(minLoglevel, message) {
  if (self.options.LOG_LEVEL > minLoglevel) {
    console.log.apply(null, message);
  }
}

self.setup = function(reset){
  if (reset) {
    self.delayedGun = null;
  }
  if (!self.delayedGun) {
    self.delayedGun = new Promise(function(resolve){
      debug(2, ['Connecting to gun-db server \'', self.options.GUN_SERVER, '\'...']);
      var gun = new Gun({
        peers: [ self.options.GUN_SERVER ],
        localStorage: false,
        indexedDB: indexedDB,
        file: self.options.GUN_DB_NAME
      });
      gun.on('hi', function(peer){
        debug(2, ['Connected to gun-db server!', peer]);
      });
      gun.on('bye', function(peer){
        debug(2, ['Disconnected from gun-db server!', peer]);
        self.delayedGun = null;
      });
      resolve(gun);
    });
  }
  return self.delayedGun;
};

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    self.clients.claim()
  );
});

self.onmessage = function(event) {
  var options = event.data;

  if (!options['GUN_SERVER']) {
    throw 'Missing parameter in service worker: "GUN_SERVER"';
  }

  self.options = {
    GUN_SERVER: options['GUN_SERVER'] || false,
    GUN_DB_NAME: options['GUN_DB_NAME'] || 'gun-db',
    GUN_WAIT_TIME: parseInt( options['GUN_WAIT_TIME'] || '1000' ),
    URL_MATCH_REGEX: new RegExp( options['URL_MATCH_REGEX'] || false ),
    FORCE_P2P: options['FORCE_P2P'] || '',
    LOG_LEVEL: options['LOG_LEVEL'] || 0
  };
  self.setup('RESET');

  event.ports[0].postMessage('And... we are live!');
}

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

function buildP2PResponse(url, dataForUrl){
  debug(2, ['Got P2P data!'])
  var init = JSON.parse(dataForUrl.init_json || '{}'),
      bodyDataUrl = dataForUrl.body_data_url;
  debug(3, ['url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70)]);
  var blob = dataURLToBlob(bodyDataUrl);
  return new Response(blob, init);
};

function trackTime(cb) {
  var startTime = new Date();
  return function end() {
    var endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    var seconds = Math.round(timeDiff /= 1000);
    cb(seconds);
  }
}

// approach taken from: http://craig-russell.co.uk/2016/01/26/modifying-service-worker-responses.html
self.addEventListener('fetch', function(event) {
  // https://stackoverflow.com/a/49719964 -- temporary fix
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  var url = event.request.url;
  if (url.match('/p2p-fetch(-sw)?\.js') || !url.match(self.options.URL_MATCH_REGEX)) {
    event.respondWith(fetch(event.request));
    return;
  }

  debug(3, ['gun.get(encodeURI("' + url + '"))']);

  event.respondWith(
    new Promise(function(resolve){

    self.setup().then(function(gun){

        var gunDBKey = encodeURI(url);

        // synchronous get (see https://gun.eco/docs/API#once)
        gun.get(gunDBKey).once(function(dataForUrl){
          if (dataForUrl) {
            resolve(buildP2PResponse(url, dataForUrl));
            return;
          }

          // asynchronous get with a user-defined timeout (see https://gun.eco/docs/API#once)
          var p2pTimeout = (self.options.FORCE_P2P != '') ? 9999999 : self.options.GUN_WAIT_TIME;

          var noDataTimer = setTimeout(function(){
            debug(1, ['No data found. Off to the internets to get: ', url]);
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
                debug(1, ['The internets have spoken. P2P storage, engage!']);
                var contentType = init.headers['content-type'] || init.headers['Content-Type'];
                var blob = new Blob([bodyArrayBuffer], {type : contentType});
                if (blob.size == 0) {
                  debug(1, ['Crap! Can\'t reach the data to store it!']);
                  return resolve(response);
                }
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                  var bodyDataUrl = reader.result;
                  gun.get(gunDBKey).put({
                    init_json: JSON.stringify(init),
                    body_data_url: bodyDataUrl
                  }, function(ack){
                    debug(3, ['url: ', url, ', init: ', init, ', body: ', bodyDataUrl.substring(0, 70)]);
                    var blob = dataURLToBlob(bodyDataUrl);
                    resolve(
                      new Response(blob, init)
                    );
                  });
                };
              });

            }); // fetch

          }, p2pTimeout); // setTimeout

          var p2pCallComplete = trackTime(function(seconds){
            debug(1, ['P2P request for ', url, ' took ', seconds, ' seconds']);
          });
          gun.get(gunDBKey, function(ack){
            debug(4, ['gun.get callback triggered with ack: ', ack]);
            var dataForUrl = ack.put;
            if (dataForUrl) {
              clearTimeout(noDataTimer);
              resolve(buildP2PResponse(url, dataForUrl));
              p2pCallComplete();
            }
          });

        }); // gun synchronous get

      }); // setup.then


    }) // Promise
  ); // event.respondWith

});
