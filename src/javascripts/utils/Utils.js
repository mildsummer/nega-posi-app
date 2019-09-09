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

export const getMediaManifest = () => {
  const ua = window.navigator.userAgent.toLowerCase();
  let manifest = {
    video: true
  };
  if (getDevice() === 'sp') {
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
