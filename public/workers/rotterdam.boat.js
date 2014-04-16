//init
self.addEventListener('init', function(e) {
  self.postMessage(e.data);
}, false);