self.onmessage = (e) => {
  const {
    imageData, base, drawing, inversion, contrast, contrastThreshold, CONTRAST_LENGTH,
    CONTRAST_THRESHOLD_LENGTH, LUMINANCE_COEFFICIENT, LUMINANCE_DATA_INTERVAL
  } = e.data;
  const { round, max, min } = Math;
  const data = imageData.data;
  const luminanceData = [];
  const contrastThresholdValue = 255 * contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
  const baseColorValue = base.value;
  const drawingColorValue = drawing.value;
  for (let i = 0; i < data.length; i += 4) {
    let luminance = (data[i] * LUMINANCE_COEFFICIENT[0]
      + data[i + 1] * LUMINANCE_COEFFICIENT[1]
      + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
    if (i / 4 % LUMINANCE_DATA_INTERVAL === 0) {
      const luminanceIndex = round(luminance);
      luminanceData[luminanceIndex] = (luminanceData[luminanceIndex] || 0) + 1;
    }
    luminance = (luminance - contrastThresholdValue)
      * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
    luminance /= 255;
    luminance = max(0, min(1, luminance));
    luminance = inversion ? (1 - luminance) : luminance;
    data[i] = round(luminance * baseColorValue[0] + (1 - luminance) * drawingColorValue[0]);
    data[i + 1] = round(luminance * baseColorValue[1] + (1 - luminance) * drawingColorValue[1]);
    data[i + 2] = round(luminance * baseColorValue[2] + (1 - luminance) * drawingColorValue[2]);
  }
  // self.postMessage({ imageData, luminanceData }, [data.buffer]);
  self.postMessage({ imageData, luminanceData });
};
