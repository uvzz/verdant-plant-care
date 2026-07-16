/** Infer image MIME from URI path (strips query/hash). Default jpeg. */
export function mimeFromPhotoUri(uri: string): string {
  const path = uri.split(/[?#]/)[0]?.toLowerCase() ?? '';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.heic') || path.endsWith('.heif')) return 'image/heic';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.jpe')) {
    return 'image/jpeg';
  }
  return 'image/jpeg';
}
