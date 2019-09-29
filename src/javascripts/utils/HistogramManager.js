import { LUMINANCE_COEFFICIENT } from '../constants/General';
let canvas = null;
let context = null;
const { round } = Math;

export default new (class HistogramManager {
  constructor() {
    this.luminanceData = [];
    this.callbacks = [];
  }

  on(callback) {
    this.callbacks.push(callback);
  }

  off(callback) {
    this.callbacks.splice(this.callbacks.indexOf(callback), 1);
  }

  update(luminanceDataOrSource) {
    if (luminanceDataOrSource.play) {
      canvas = canvas || document.createElement('canvas');
      context = context || canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;
      context.drawImage(luminanceDataOrSource, 0, 0, canvas.width, canvas.height);
      const luminanceData = [];
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0, length = data.length; i < length; i += 4) {
        const luminance = round(data[i] * LUMINANCE_COEFFICIENT[0]
          + data[i + 1] * LUMINANCE_COEFFICIENT[1]
          + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
        luminanceData[luminance] = (luminanceData[luminance] || 0) + 1;
      }
      this.luminanceData = luminanceData;
    } else {
      this.luminanceData = luminanceDataOrSource;
    }
    this.callbacks.forEach((callback) => {
      callback(this.luminanceData);
    });
  }
});
