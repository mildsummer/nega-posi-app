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
  value: hsvToRgb([hsv[0] === 1 ? 0 : hsv[0] * 360, hsv[1] * 100, hsv[2] * 100]),
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

export const max = (array) => {
  let max = 0;
  array.forEach((item) => {
    if (max < item) {
      max = item;
    }
  });
  return max;
};

export const throttle = (func, wait = 100) => {
  let timer = null;
  return function(...args) {
    if (timer === null) {
      timer = window.setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, wait);
    }
  };
};

export const rgbToHex = (rgb) => {
  const integer = ((Math.round(rgb[0]) & 0xFF) << 16)
    + ((Math.round(rgb[1]) & 0xFF) << 8)
    + (Math.round(rgb[2]) & 0xFF);
  const string = integer.toString(16).toUpperCase();
  return '000000'.substring(string.length) + string;
};

export const rgbToHsv = (rgb) => {
  let rdif;
  let gdif;
  let bdif;
  let h;
  let s;

  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const v = Math.max(r, g, b);
  const diff = v - Math.min(r, g, b);
  const diffc = function (c) {
    return (v - c) / 6 / diff + 1 / 2;
  };

  if (diff === 0) {
    h = 0;
    s = 0;
  } else {
    s = diff / v;
    rdif = diffc(r);
    gdif = diffc(g);
    bdif = diffc(b);

    if (r === v) {
      h = bdif - gdif;
    } else if (g === v) {
      h = (1 / 3) + rdif - bdif;
    } else if (b === v) {
      h = (2 / 3) + gdif - rdif;
    }

    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }

  return [
    h * 360,
    s * 100,
    v * 100
  ];
};

export const hsvToRgb = (hsv) => {
  const h = hsv[0] / 60;
  const s = hsv[1] / 100;
  let v = hsv[2] / 100;
  const hi = Math.floor(h) % 6;

  const f = h - Math.floor(h);
  const p = 255 * v * (1 - s);
  const q = 255 * v * (1 - (s * f));
  const t = 255 * v * (1 - (s * (1 - f)));
  v *= 255;

  switch (hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
    default:
      return [0, 0, 0];
  }
};
