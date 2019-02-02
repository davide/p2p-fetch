
window.p2pFetch = (function(){
  const searchParams = new URLSearchParams(window.location.search);
  const LOG_LEVEL = parseInt(searchParams.get('LOG_LEVEL')) || 0;

  if (!('serviceWorker' in navigator)) {
    return function(){
      if (LOG_LEVEL > 1) console.log('P2P FETCH: Service workers are not supported.');
    };
  }

  var scriptUrl = new URL(document.currentScript.src),
      pathname = scriptUrl.pathname,
      match = pathname.match('[^/]+\.js$'),
      path = match ? pathname.substr(0, match.index) : '/';
  var serviceWorkerUrl = path + 'p2p-fetch-sw.js';

  // https://googlechrome.github.io/samples/service-worker/post-message/
  // https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage
  function configServiceWorker(msg) {
    return new Promise(function(resolve, reject) {
      var msgChannel = new MessageChannel();
      msgChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };
      navigator.serviceWorker.controller.postMessage(msg, [msgChannel.port2]);
    });
  }

  var p2pFetchPromise = new Promise(function(resolve, reject){
    navigator.serviceWorker.register(serviceWorkerUrl, { scope: path }).then(function(reg) {

      if (LOG_LEVEL > 1) {
        console.log('P2P FETCH: ServiceWorker registration successful with scope: ', reg.scope);
        if(reg.installing) {
          console.log('P2P FETCH: ServiceWorker installing');
        } else if(reg.waiting) {
          console.log('P2P FETCH: ServiceWorker installed');
        } else if(reg.active) {
          console.log('P2P FETCH: ServiceWorker active');
        }
      }

      // The code below exists to ensure that ALL requests are tracked by the Service Worker. Even with the
      // call to clients.claim() inside the ServiceWorker activate event some requests would be skipped.
      //  - https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9
      //  - https://gist.github.com/Rich-Harris/fd6c3c73e6e707e312d7c5d7d0f3b2f9#gistcomment-2737157
      const promise = new Promise(resolve => {
        if (navigator.serviceWorker.controller) return resolve();
        navigator.serviceWorker.addEventListener('controllerchange', e => resolve());
      });
      promise.then(() => {
        resolve();
      });

    }).catch(function(error) {
      reject('P2P FETCH: Service Worker registration failed with ' + error);
    });
  });

  return function(opts) {
    var missing = [];
    if (!opts['FETCH_PATTERN']) { missing.push('FETCH_PATTERN'); }
    if (!opts['SERVER']) { missing.push('SERVER'); }
    if (missing.length > 0) {
      return new Promise(function(_resolve, reject){
        reject('P2P FETCH: missing parameters ' + missing.join(', '));
      });
    }

    var config = {
      'GUN_SERVER' : opts['SERVER'] || false,
      'GUN_DB_NAME': opts['DB_NAME'] || 'p2p-fetch',
      'GUN_WAIT_TIME': opts['TIMEOUT'] || 5000,
      'URL_MATCH_REGEX': opts['FETCH_PATTERN'] || false,
      'FORCE_P2P': searchParams.get('FORCE_P2P'),
      'LOG_LEVEL': LOG_LEVEL
    };

    return p2pFetchPromise.then(function(){
      return configServiceWorker(config);
    });
  }

})();
