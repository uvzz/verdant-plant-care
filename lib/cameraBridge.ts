/**
 * One-shot bridge so any screen can open /camera and await a photo URI.
 * Avoids fragile router param round-trips for large local file URIs.
 */

type Resolver = (uri: string | null) => void;

let pending: Resolver | null = null;

export function requestCameraCapture(): Promise<string | null> {
  return new Promise((resolve) => {
    // Cancel any previous waiter
    if (pending) pending(null);
    pending = resolve;
  });
}

export function deliverCameraCapture(uri: string | null): void {
  const r = pending;
  pending = null;
  r?.(uri);
}

export function cancelCameraCapture(): void {
  deliverCameraCapture(null);
}
