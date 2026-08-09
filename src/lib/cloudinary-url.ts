type CloudinaryTransformOptions = {
  transformation: string;
};

export function buildCloudinaryTransformedUrl(
  sourceUrl: string,
  { transformation }: CloudinaryTransformOptions,
) {
  const uploadSegment = "/upload/";
  const uploadIndex = sourceUrl.indexOf(uploadSegment);

  if (uploadIndex === -1) return sourceUrl;

  const prefix = sourceUrl.slice(0, uploadIndex + uploadSegment.length);
  const suffix = sourceUrl.slice(uploadIndex + uploadSegment.length);

  return `${prefix}${transformation}/${suffix}`;
}
