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

  update(luminanceData) {
    this.luminanceData = luminanceData;
    this.callbacks.forEach((callback) => {
      callback(luminanceData);
    });
  }
});
