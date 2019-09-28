const dir = './assets/vendor';
const vendors = [{
  url: `${dir}/three.min.js`,
  key: 'THREE'
}, {
  url: `${dir}/OrbitControls.js`,
  key: ['THREE', 'OrbitControls']
}];
let hasRequested = false;
let requestNum = 0;
let callbacks = [];
let ended = false;
let hasSuccessed = false;

function load() {
  const script = document.createElement('script');
  script.onload = () => {
    requestNum += 1;
    if (requestNum === vendors.length) {
      ended = true;
      hasSuccessed = true;
      callbacks.forEach((cb) => {
        cb(true);
      });
    } else {
      load();
    }
  };
  script.onerror = () => {
    requestNum += 1;
    ended = true;
    callbacks.forEach((cb) => {
      cb(false);
    });
  };
  script.src = vendors[requestNum].url;
  document.body.appendChild(script);
}

export default (callback = null) => {
  if (callback) {
    callbacks.push(callback);
  }
  if (!hasRequested) {
    hasRequested = true;
    load();
  }
  if (ended) {
    callback(hasSuccessed);
  }
};
