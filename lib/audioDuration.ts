// Offline decoding reads file length without playing audio or requesting microphone access.
export async function readAudioDuration(blob: Blob, signal?: AbortSignal): Promise<number | undefined> {
  if (signal?.aborted) return undefined;
  const Context = typeof window !== "undefined" ? window.OfflineAudioContext : undefined;
  if (!Context) return undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const decoding = (async () => {
      const bytes = await blob.arrayBuffer();
      if (signal?.aborted) return undefined;
      const context = new Context(1, 1, 44100);
      const decoded = await context.decodeAudioData(bytes);
      return !signal?.aborted && Number.isFinite(decoded.duration) && decoded.duration > 0 ? decoded.duration : undefined;
    })();
    return await Promise.race([
      decoding,
      new Promise<undefined>(resolve => { timer = setTimeout(() => resolve(undefined), 15000); }),
    ]);
  } catch {
    return undefined;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
