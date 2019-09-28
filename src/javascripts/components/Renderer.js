import CameraWorker from 'worker-loader?inline&fallback&name=worker.js!../worker';
import HistogramManager from '../utils/HistogramManager';
import {
  CONTRAST_LENGTH,
  CONTRAST_THRESHOLD_LENGTH,
  LUMINANCE_COEFFICIENT,
  LUMINANCE_DATA_INTERVAL, LUMINANCE_DATA_UNIT
} from '../constants/General';

export default class Renderer {
  constructor(canvas, source, data) {
    this.canvas = canvas;
    this.source = source;
    this.data = data;
    this.worker = new CameraWorker;
    this.worker.onmessage = this.onWorkerMessage.bind(this);
    this.hasPostedToWorker = false;
    this.dummyCanvas = document.createElement('canvas');
    this.dummyCanvas.width = this.canvas.width;
    this.dummyCanvas.height = this.canvas.height;
  }

  render(data, cacheSource = null) {
    this.data = data;
    if (!this.hasPostedToWorker) {
      const { width, height } = this.canvas;
      const { base, drawing, contrast, contrastThreshold, inversion, flip } = data;
      const videoWidth = this.source.videoWidth;
      const videoHeight = this.source.videoHeight;
      const context = (this.dummyCanvas || this.canvas).getContext('2d');
      const source = cacheSource || this.source;
      if (flip) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      if (videoWidth / videoHeight > width / height) {
        const w = videoWidth * (height / videoHeight);
        context.drawImage(source, (width - w) / 2, 0, w, height);
      } else {
        const h = videoHeight * (width / videoWidth);
        context.drawImage(source, 0, (height - h) / 2, width, h);
      }
      context.resetTransform();
      const imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.hasPostedToWorker = true;
      this.worker.postMessage({
        imageData,
        base,
        drawing,
        inversion,
        contrast,
        contrastThreshold,
        CONTRAST_LENGTH,
        CONTRAST_THRESHOLD_LENGTH,
        LUMINANCE_COEFFICIENT,
        LUMINANCE_DATA_INTERVAL,
        LUMINANCE_DATA_UNIT
        // }, [imageData.data.buffer]);
      });
    }
  }

  onWorkerMessage(e) {
    const context = this.canvas.getContext('2d');
    context.putImageData(e.data.imageData, 0, 0);
    HistogramManager.update(e.data.luminanceData);
    this.hasPostedToWorker = false;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.dummyCanvas.width = width;
    this.dummyCanvas.height = height;
    this.render(this.data);
  }
}
