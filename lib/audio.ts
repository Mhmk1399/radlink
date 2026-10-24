export const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

const AUDIO_EXTENSIONS: Record<string, string> = {
  mp3: "audio/mpeg", mp2: "audio/mpeg", mpeg: "audio/mpeg", mpga: "audio/mpeg",
  m4a: "audio/mp4", m4b: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac",
  wav: "audio/wav", wave: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg",
  flac: "audio/flac", webm: "audio/webm", aif: "audio/aiff", aiff: "audio/aiff", aifc: "audio/aiff",
  amr: "audio/amr", awb: "audio/amr-wb", wma: "audio/x-ms-wma", caf: "audio/x-caf",
  "3gp": "audio/3gpp", "3g2": "audio/3gpp2", au: "audio/basic", snd: "audio/basic",
};

type AudioFileInfo = { name: string; type: string };

export function getAudioMimeType(file: AudioFileInfo): string {
  const type = file.type.toLowerCase().split(";", 1)[0].trim();
  if (/^audio\/[a-z0-9!#$&^_.+-]+$/.test(type)) return type;
  if (type === "application/ogg") return "audio/ogg";
  if (!type || type === "application/octet-stream" || type === "video/webm" || type === "video/mp4" || type === "video/3gpp") {
    return AUDIO_EXTENSIONS[file.name.split(".").pop()?.toLowerCase() ?? ""] ?? "";
  }
  return "";
}

export function isAudioFile(file: AudioFileInfo): boolean {
  return Boolean(getAudioMimeType(file));
}
