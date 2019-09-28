const dir = './assets/vendor';
const vendors = [`${dir}/three.min.js`, `${dir}/OrbitControls.min.js`];
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
  script.src = vendors[requestNum];
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
