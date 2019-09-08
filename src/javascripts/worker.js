self.onmessage = (e) => {
  const {
    imageData, baseColor, drawingColor, inversion, contrast, contrastThreshold, CONTRAST_LENGTH,
    CONTRAST_THRESHOLD_LENGTH, LUMINANCE_DATA_UNIT, LUMINANCE_COEFFICIENT, LUMINANCE_DATA_INTERVAL
  } = e.data;
  const data = imageData.data;
  const luminanceData = [];
  const contrastThresholdValue = 255 * contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
  for (let i = 0; i < data.length; i += 4) {
    let luminance = (data[i] * LUMINANCE_COEFFICIENT[0]
      + data[i + 1] * LUMINANCE_COEFFICIENT[1]
      + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
    if (i / 4 % LUMINANCE_DATA_INTERVAL === 0) {
      const luminanceIndex = Math.round(luminance / LUMINANCE_DATA_UNIT);
      luminanceData[luminanceIndex] = (luminanceData[luminanceIndex] || 0) + 1;
    }
    luminance = (luminance - contrastThresholdValue)
      * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
    luminance /= 255;
    luminance = Math.max(0, Math.min(1, luminance));
    luminance = inversion ? (1 - luminance) : luminance;
    data[i] = Math.round(luminance * baseColor.value[0] + (1 - luminance) * drawingColor.value[0]);
    data[i + 1] = Math.round(luminance * baseColor.value[1] + (1 - luminance) * drawingColor.value[1]);
    data[i + 2] = Math.round(luminance * baseColor.value[2] + (1 - luminance) * drawingColor.value[2]);
  }
  self.postMessage({ imageData, luminanceData });
};
