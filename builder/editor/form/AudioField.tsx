"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineCloudArrowUp, HiOutlineMicrophone, HiOutlineStop, HiOutlineTrash } from "react-icons/hi2";
import { uploadFile } from "@/lib/fileUtils";
import { readAudioDuration } from "@/lib/audioDuration";
import { getAudioMimeType, isAudioFile, MAX_AUDIO_SIZE } from "@/lib/audio";

const ACCEPT = "audio/*,.mp3,.m4a,.wav,.ogg,.opus,.aac,.flac,.webm,.aiff,.aif,.amr,.wma,.caf,.3gp";
const RECORDING_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"];
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-50";

export function AudioField({ value, onChange, label = "فایل صوتی" }: { value: string; onChange: (url: string, durationSeconds?: number) => void; label?: string }) {
  const [status, setStatus] = useState<"idle" | "permission" | "recording" | "uploading">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const generation = useRef(0);
  const durationRequest = useRef<AbortController | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewRef = useRef("");
  const recordedFile = useRef<File | null>(null);
  const recordingStartedAt = useRef(0);
  const recordingStoppedAt = useRef(0);
  const recordedDuration = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  function releaseMicrophone() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
  function clearPreview() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    recordedFile.current = null;
    recordedDuration.current = undefined;
    setPreview("");
  }
  function cancel() {
    generation.current += 1;
    durationRequest.current?.abort();
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    releaseMicrophone();
    clearPreview();
    setElapsed(0);
    setStatus("idle");
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      durationRequest.current?.abort();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      releaseMicrophone();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recordingStoppedAt.current = Date.now();
      recorderRef.current.stop();
    }
  }
  async function upload(file: File, durationSeconds?: number) {
    if (!file.size) { setError("فایل صوتی خالی است."); return; }
    if (!isAudioFile(file)) { setError("لطفاً یک فایل صوتی معتبر انتخاب کنید."); return; }
    if (file.size > MAX_AUDIO_SIZE) { setError("حداکثر حجم فایل صوتی ۵۰ مگابایت است."); return; }
    const current = ++generation.current;
    setStatus("uploading");
    setError("");
    try {
      const normalized = new File([file], file.name, { type: getAudioMimeType(file) });
      durationRequest.current?.abort();
      const controller = new AbortController();
      durationRequest.current = controller;
      const [result, measuredDuration] = await Promise.all([
        uploadFile(normalized),
        durationSeconds ? Promise.resolve(durationSeconds) : readAudioDuration(normalized, controller.signal),
      ]);
      if (!mounted.current || current !== generation.current) return;
      onChangeRef.current(result.url, measuredDuration);
      clearPreview();
    } catch (cause) {
      if (mounted.current && current === generation.current) setError(cause instanceof Error ? cause.message : "آپلود فایل صوتی انجام نشد. دوباره تلاش کنید.");
    } finally {
      if (mounted.current && current === generation.current) setStatus("idle");
    }
  }
  async function startRecording() {
    setError("");
    if (!window.isSecureContext) { setError("برای ضبط صدا، صفحه باید با HTTPS یا روی localhost باز شود."); return; }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("این مرورگر ضبط صدا را پشتیبانی نمی‌کند؛ می‌توانید فایل صوتی آپلود کنید."); return; }
    clearPreview();
    const current = ++generation.current;
    setStatus("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || current !== generation.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      const mimeType = RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      let bytes = 0;
      recorder.ondataavailable = (event) => {
        if (current !== generation.current || !event.data.size) return;
        chunks.push(event.data);
        bytes += event.data.size;
        if (bytes > MAX_AUDIO_SIZE && recorder.state === "recording") stopRecording();
      };
      recorder.onstop = () => {
        if (!mounted.current || current !== generation.current) return;
        releaseMicrophone();
        recorderRef.current = null;
        setStatus("idle");
        const type = recorder.mimeType || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type });
        if (!blob.size || blob.size > MAX_AUDIO_SIZE) { setError("ضبط خالی است یا حجم آن بیشتر از ۵۰ مگابایت است. دوباره ضبط کنید."); return; }
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const seconds = ((recordingStoppedAt.current || Date.now()) - recordingStartedAt.current) / 1000;
        recordedDuration.current = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 300) : undefined;
        recordedFile.current = new File([blob], `voice-${Date.now()}.${extension}`, { type });
        previewRef.current = URL.createObjectURL(blob);
        setPreview(previewRef.current);
      };
      recorder.onerror = () => {
        if (!mounted.current || current !== generation.current) return;
        cancel();
        setError("ضبط صدا با خطا متوقف شد. دوباره تلاش کنید.");
      };
      recordingStartedAt.current = Date.now();
      recordingStoppedAt.current = 0;
      recorder.start(1000);
      setElapsed(0);
      setStatus("recording");
      const started = recordingStartedAt.current;
      timerRef.current = setInterval(() => {
        if (!mounted.current || current !== generation.current) return;
        const seconds = Math.floor((Date.now() - started) / 1000);
        setElapsed(Math.min(seconds, 300));
        if (seconds >= 300 && recorder.state === "recording") stopRecording();
      }, 250);
    } catch (cause) {
      if (!mounted.current || current !== generation.current) return;
      releaseMicrophone();
      setStatus("idle");
      setError(cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "SecurityError") ? "اجازه دسترسی به میکروفون داده نشد. مجوز مرورگر را بررسی کنید یا فایل آپلود کنید." : "میکروفون در دسترس نیست. اتصال آن را بررسی کنید یا فایل آپلود کنید.");
    }
  }
  const busy = status !== "idle";
  return (
    <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3" role="group" aria-label={label}>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={busy} onClick={() => inputRef.current?.click()}><HiOutlineCloudArrowUp size={17} />انتخاب فایل صوتی</button>
        {status === "recording" ? <button type="button" className={`${buttonClass} !border-red-200 !bg-red-50 !text-red-700`} onClick={stopRecording}><HiOutlineStop size={17} />توقف ضبط <span dir="ltr">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span></button> : <button type="button" className={buttonClass} disabled={busy} onClick={() => void startRecording()}><HiOutlineMicrophone size={17} />ضبط صدا</button>}
        {busy && <button type="button" className={buttonClass} onClick={cancel}>لغو</button>}
      </div>
      <input ref={inputRef} className="hidden" type="file" accept={ACCEPT} aria-label={label} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} />
      <p className="text-[10px] leading-5 text-neutral-500">حداکثر ۵۰ مگابایت · ضبط تا ۵ دقیقه. پخش هر فرمت به پشتیبانی مرورگر بازدیدکننده بستگی دارد.</p>
      <p role="status" aria-live="polite" className="text-xs text-blue-700">{status === "permission" ? "در انتظار اجازه دسترسی به میکروفون…" : status === "uploading" ? "در حال آپلود فایل صوتی…" : status === "recording" ? "در حال ضبط؛ پس از توقف می‌توانید صدا را گوش کنید." : ""}</p>
      {preview && <div className="space-y-2 border-t border-blue-100 pt-3"><p className="text-xs font-semibold text-neutral-700">پیش‌نمایش ضبط</p><audio key={preview} src={preview} controls className="w-full" onError={() => setError("این مرورگر قادر به پخش این ضبط نیست.")} /><div className="flex flex-wrap gap-2"><button type="button" className={`${buttonClass} !border-blue-600 !bg-blue-600 !text-white`} disabled={busy} onClick={() => { if (recordedFile.current) void upload(recordedFile.current, recordedDuration.current); }}>استفاده از ضبط</button><button type="button" className={buttonClass} onClick={cancel}>حذف ضبط</button></div></div>}
      {value && <div className="space-y-2 border-t border-blue-100 pt-3"><audio key={value} src={value} controls preload="metadata" className="w-full" onError={() => setError("این فایل در مرورگر شما قابل پخش نیست؛ فرمت دیگری مانند MP3 انتخاب کنید.")} /><button type="button" disabled={busy} className={`${buttonClass} !text-red-600`} onClick={() => { cancel(); setError(""); onChangeRef.current(""); }}><HiOutlineTrash size={14} />حذف فایل صوتی</button></div>}
      {error && <p role="alert" className="text-xs leading-6 text-red-600">{error}</p>}
    </div>
  );
}
