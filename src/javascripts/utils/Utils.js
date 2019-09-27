import color from 'color-convert';

export const getDevice = () => {
  let device = 'other';
  const ua = window.navigator.userAgent;
  if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
    device = 'sp';
  }else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
    device = 'tab';
  }
  return device;
};

export const getMediaManifest = (isForcePC = false) => {
  const ua = window.navigator.userAgent.toLowerCase();
  let manifest = {
    video: true
  };
  if (getDevice() === 'sp' && !isForcePC) {
    console.log('SP');
    manifest = {
      video: {
        width: 1024,
          height: 768,
          facingMode: {
          exact: 'environment'
        }
      }
    };
  } else if (ua.indexOf('msie') !== -1 || ua.indexOf('trident') !== -1) {
    console.log('Internet Explorer');
  } else if(ua.indexOf('edge') !== -1) {
    console.log('Edge');
  } else if(ua.indexOf('chrome') !== -1) {
    console.log('Chrome');
    manifest = {
      video: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  } else if(ua.indexOf('safari') !== -1) {
    console.log('Safari');
  } else if(ua.indexOf('firefox') !== -1) {
    console.log('FireFox');
  } else if(ua.indexOf('opera') !== -1) {
    console.log('Opera');
  } else {
    console.log('other');
  }
  return manifest;
};

export const createCustomColor = (hsv) => ({
  name: `user custom color`,
  value: color.hsv.rgb(hsv[0] === 1 ? 0 : hsv[0] * 360, hsv[1] * 100, hsv[2] * 100),
  isCustom: true
});

export const find = (array, iterator) => {
  let result = null;
  if (typeof iterator === 'function') {
    for (let i = 0; i < array.length; i += 1) {
      const item = array[i];
      if (iterator(item)) {
        result = item;
        break;
      }
    }
  } else if (typeof iterator === 'object') {
    for (let i = 0; i < array.length; i += 1) {
      const item = array[i];
      if (item) {
        let flag = true;
        const keys = Object.keys(iterator);
        for (let j = 0; j < keys.length; j += 1) {
          const key = keys[j];
          if (item[key] !== iterator[key]) {
            flag = false;
            break;
          }
        }
        if (flag) {
          result = item;
          break;
        }
      }
    }
  } else {
    for (let i = 0; i < array.length; i += 1) {
      const item = array[i];
      if (item === iterator) {
        result = item;
        break;
      }
    }
  }
  return result;
};

export const assign = Object.assign || function(target) {
  const to = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    let nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }
    nextSource = Object(nextSource);
    let keysArray = Object.keys(Object(nextSource));
    for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      const nextKey = keysArray[nextIndex];
      const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (typeof desc !== 'undefined' && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
};

export const isEqual = (a, b) => {
  let result = true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      result = false;
    } else {
      for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
          result = false;
          break;
        }
      }
    }
  } else if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      result = false;
    } else {
      for (let i = 0; i < keysA.length; i += 1) {
        if (a[keysA[i]] !== b[keysA[i]]) {
          result = false;
          break;
        }
      }
    }
  } else {
    result = a === b;
  }
  return result;
};
