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
let cb = null;

export default (callback = null) => {
  cb = callback || function(){};
  function load() {
    const script = document.createElement('script');
    script.onload = () => {
      requestNum += 1;
      if (requestNum === vendors.length) {
        cb(true);
      } else {
        load();
      }
    };
    script.onerror = () => {
      requestNum += 1;
      cb(false);
    };
    script.src = vendors[requestNum].url;
    document.body.appendChild(script);
  }
  if (hasRequested) {
    if (requestNum === vendors.length) {
      cb(true);
    }
  } else {
    hasRequested = true;
    load();
  }
};
