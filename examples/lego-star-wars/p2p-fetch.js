(function(){

  if (!('serviceWorker' in navigator)) {
    console.log('P2P FETCH: ServiceWorker not supported')
    return;
  }
  const queryParams = window.location.search.substring(1).split('&'),
        scriptSrc = document.currentScript.src,
        scriptUrl = new URL(scriptSrc),
        scriptQueryParams = scriptUrl.search.substring(1).split('&');

  function getQueryParam(queryParams, key, defaultValue) {
    for(var i in queryParams) {
      var pair = queryParams[i].split('=');
      if (decodeURIComponent(pair[0]) == key) {
        return decodeURIComponent(pair[1]) || defaultValue;
      }
    }
    return defaultValue;
  }
   
  const FETCH_PATTERN = getQueryParam(scriptQueryParams, 'FETCH_PATTERN', false);
  const SERVER = getQueryParam(scriptQueryParams, 'SERVER', false);
  const DB_NAME = getQueryParam(scriptQueryParams, 'DB_NAME', 'p2p-fetch');
  const TIMEOUT = getQueryParam(scriptQueryParams, 'TIMEOUT', '5000');
  const FORCE_P2P = getQueryParam(queryParams, 'FORCE_P2P', '');

  var missing = [];
  if (!FETCH_PATTERN) { missing.push('FETCH_PATTERN'); }
  if (!SERVER) { missing.push('SERVER'); }
  if (missing.length > 0) {
    console.log('P2P FETCH: missing parameters ' + missing.join(', '));
    return;
  }

  var options = {
    'GUN_SERVER' : SERVER,
    'GUN_DB_NAME': DB_NAME,
    'GUN_WAIT_TIME': TIMEOUT,
    'URL_MATCH_REGEX': FETCH_PATTERN,
    'FORCE_P2P': FORCE_P2P
  };

  function serialize(obj) {
    var str = [];
    for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&");
  }
  var pathname = scriptUrl.pathname,
      match = pathname.match('[^/]+\.js$'),
      path = match ? pathname.substr(0, match.index) : '/';
  var serviceWorkerUrl = path + 'p2p-fetch-sw.js?' + serialize(options);
  navigator.serviceWorker.register(serviceWorkerUrl, { scope: path }).then(function(reg) {

    console.log('P2P FETCH: ServiceWorker registration successful with scope: ', reg.scope);

    if(reg.installing) {
      console.log('P2P FETCH: ServiceWorker installing');
    } else if(reg.waiting) {
      console.log('P2P FETCH: ServiceWorker installed');
    } else if(reg.active) {
      console.log('P2P FETCH: ServiceWorker active');
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
      const event = new Event('p2p-fetch-ready');
      document.body.dispatchEvent(event);
    });

  }).catch(function(error) {
    // registration failed
    console.log('P2P FETCH: Service Workregistration failed with ' + error);
  });

})();
