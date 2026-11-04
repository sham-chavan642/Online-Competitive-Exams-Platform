let preparedCameraStream = null;

export const storePreparedCameraStream = (stream) => {
  preparedCameraStream = stream;
};

export const takePreparedCameraStream = () => {
  const stream = preparedCameraStream;
  preparedCameraStream = null;
  return stream;
};

export const stopPreparedCameraStream = () => {
  if (!preparedCameraStream) return;
  preparedCameraStream.getTracks().forEach((track) => track.stop());
  preparedCameraStream = null;
};
