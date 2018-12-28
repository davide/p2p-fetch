(function(){

  if (!('serviceWorker' in navigator)) {
    console.log('P2P FETCH: ServiceWorker not supported')
    return;
  }
  const scriptSrc = document.currentScript.src,
        scriptUrl = new URL(scriptSrc),
        queryParams = scriptUrl.search.substring(1).split('&');

  function getQueryParam(key, defaultValue) {
    for(var i in queryParams) {
      var pair = queryParams[i].split('=');
      if (decodeURIComponent(pair[0]) == key) {
        return decodeURIComponent(pair[1]) || defaultValue;
      }
    }
    return defaultValue;
  }
   
  const FETCH_PATTERN = getQueryParam('FETCH_PATTERN', false);
  const SERVER = getQueryParam('SERVER', false);
  const DB_NAME = getQueryParam('DB_NAME', 'p2p-fetch');
  const TIMEOUT = getQueryParam('TIMEOUT', '5000');

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
    'URL_MATCH_REGEX': FETCH_PATTERN
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

  }).catch(function(error) {
    // registration failed
    console.log('P2P FETCH: Service Workregistration failed with ' + error);
  });
})();
