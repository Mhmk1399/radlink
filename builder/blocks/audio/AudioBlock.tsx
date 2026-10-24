"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { readAudioDuration } from "@/lib/audioDuration";
import { HiMiniPause, HiMiniPlay, HiOutlineMicrophone } from "react-icons/hi2";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import { responsiveStyleToCss, sharedBlockKeyframes } from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

export type AudioTrack = { id: string; title: string; audioUrl: string; caption: string; enabled: boolean; duration?: number };
export function normalizeAudioTracks(value: unknown): AudioTrack[] {
  return Array.isArray(value) ? value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const url = typeof entry.audioUrl === "string" ? entry.audioUrl.trim() : "";
    const duration = typeof entry.audioUrlDuration === "number" && Number.isFinite(entry.audioUrlDuration) && entry.audioUrlDuration > 0 ? entry.audioUrlDuration : undefined;
    return [{ duration, id: String(entry.id ?? `audio-${index}`), title: String(entry.title ?? ""), caption: String(entry.caption ?? ""), enabled: entry.enabled !== false, audioUrl: /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : "" }];
  }) : [];
}
export function formatAudioTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
const Root = styled.section<{ $css: string }>`
  ${sharedBlockKeyframes("audio")}
  width: 100%; min-width: 0; padding-inline: 16px;
  ${(p) => p.$css}
`;
const Heading = styled.h2<{ $css: string }>`margin: 0 0 8px; font-weight: 800; line-height: 1.6; overflow-wrap: anywhere; ${(p) => p.$css}`;
const Description = styled.p<{ $css: string }>`margin: 0 0 16px; line-height: 1.9; white-space: pre-wrap; overflow-wrap: anywhere; ${(p) => p.$css}`;
const List = styled.div`display: grid; gap: 12px; min-width: 0; margin-top: 14px; > * { min-width: 0; }`;
const Card = styled.div<{ $css: string }>`padding: 16px; background: #ebf2fa; border-radius: 20px; color: #064789; min-width: 0; ${(p) => p.$css}`;
const PlayerRow = styled.div`display: flex; align-items: center; gap: 12px; min-width: 0;`;
const Play = styled.button<{ $css: string }>`
  display: grid; place-items: center; flex: 0 0 48px; width: 48px; height: 48px;
  border: 0; border-radius: 50%; background: #064789; color: white; cursor: pointer;
  &:disabled { opacity: .5; cursor: default; } &:focus-visible { outline: 3px solid #427aa1; outline-offset: 3px; }
  ${(p) => p.$css}
`;
const Main = styled.div`flex: 1; min-width: 0;`;
const TrackTitle = styled.div`font-size: 14px; font-weight: 700; overflow-wrap: anywhere; line-height: 1.7; margin-bottom: 3px;`;
const Wave = styled.div`position: relative; height: 30px; direction: ltr;`;
const Bars = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 2px; position: absolute; inset: 0; pointer-events: none;`;
const Bar = styled.span<{ $height: number; $played: boolean }>`flex: 1; max-width: 5px; border-radius: 3px; height: ${(p) => p.$height}px; background: currentColor; opacity: ${(p) => p.$played ? 1 : .25};`;
const Seek = styled.input`position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; &:disabled { cursor: default; } &:focus-visible { opacity: .85; accent-color: #064789; }`;
const Meta = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 3px; font-size: 11px; font-variant-numeric: tabular-nums;`;
const Speed = styled.button`border: 1px solid currentColor; border-radius: 6px; padding: 1px 6px; color: inherit; background: transparent; cursor: pointer; min-width: 38px; min-height: 28px; font: inherit; &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }`;
const Caption = styled.p<{ $css: string }>`margin: 10px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; ${(p) => p.$css}`;
const Status = styled.p`margin: 8px 0 0; font-size: 12px; line-height: 1.8; overflow-wrap: anywhere;`;
const BARS = Array.from({ length: 40 }, (_, index) => 7 + ((index * 17 + index * index * 3) % 23));
const PLAY_EVENT = "radlink:audio-play";

function VoicePlayer({ track, buttonCss, editButton }: { track: AudioTrack; buttonCss: string; editButton: (child: React.ReactNode) => React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestRef = useRef(0);
  const playIntentRef = useRef(false);
  const ownerRef = useRef({});
  const durationRequest = useRef<AbortController | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(track.duration ?? 0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    const audio = audioRef.current;
    const pauseOther = (event: Event) => {
      if ((event as CustomEvent).detail !== ownerRef.current) {
        requestRef.current += 1;
        playIntentRef.current = false;
        audio?.pause();
      }
    };
    window.addEventListener(PLAY_EVENT, pauseOther);
    return () => { durationRequest.current?.abort(); requestRef.current += 1; playIntentRef.current = false; audio?.pause(); window.removeEventListener(PLAY_EVENT, pauseOther); };
  }, []);
  const recoverDuration = (audio: HTMLAudioElement) => {
    if (duration > 0 || (Number.isFinite(audio.duration) && audio.duration > 0) || durationRequest.current) return;
    const controller = new AbortController();
    durationRequest.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    void fetch(track.audioUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Audio duration unavailable");
        return response.blob();
      })
      .then(blob => readAudioDuration(blob, controller.signal))
      .then(seconds => { if (!controller.signal.aborted && seconds) setDuration(previous => previous > 0 ? previous : seconds); })
      .catch(() => { /* Native playback remains available when metadata cannot be read. */ })
      .finally(() => { clearTimeout(timer); });
  };
  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playIntentRef.current) { requestRef.current += 1; playIntentRef.current = false; audio.pause(); return; }
    const request = ++requestRef.current;
    playIntentRef.current = true;
    setError("");
    recoverDuration(audio);
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: ownerRef.current }));
    try {
      await audio.play();
      if (!playIntentRef.current) audio.pause();
    } catch {
      if (request === requestRef.current) { playIntentRef.current = false; setPlaying(false); setError("پخش ممکن نیست؛ دوباره تلاش کنید یا فایل را بررسی کنید."); }
    }
  };
  const progress = duration > 0 ? time / duration : 0;
  return <>
    <audio ref={audioRef} src={track.audioUrl || undefined} preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={(event) => {
        playIntentRef.current = false;
        setPlaying(false);
        const current = event.currentTarget.currentTime;
        const actual = Number.isFinite(current) && current > 0 ? current : duration;
        setTime(actual);
        if ((!Number.isFinite(event.currentTarget.duration) || event.currentTarget.duration <= 0) && actual > 0) setDuration(actual);
      }}
      onTimeUpdate={(event) => {
        setTime(event.currentTarget.currentTime);
        const n = event.currentTarget.duration;
        if (Number.isFinite(n) && n > 0) setDuration(n);
      }}
      onLoadedMetadata={(event) => {
        const n = event.currentTarget.duration;
        if (Number.isFinite(n) && n > 0) setDuration(n);
      }}
      onDurationChange={(event) => { const n = event.currentTarget.duration; setDuration(previous => Number.isFinite(n) && n > 0 ? n : track.duration ?? previous); }}
      onError={() => { playIntentRef.current = false; requestRef.current += 1; setPlaying(false); setError("این فایل در دسترس نیست یا مرورگر از فرمت آن پشتیبانی نمی‌کند."); }} />
    <PlayerRow>
      {editButton(<Play type="button" $css={buttonCss} disabled={!track.audioUrl} aria-label={`${playing ? "توقف" : "پخش"} ${track.title || "پیام صوتی"}`} onClick={() => void toggle()}>{playing ? <HiMiniPause size={23} /> : track.audioUrl ? <HiMiniPlay size={23} /> : <HiOutlineMicrophone size={23} />}</Play>)}
      <Main>
        <TrackTitle>{track.title || "پیام صوتی"}</TrackTitle>
        <Wave>
          <Bars aria-hidden="true">{BARS.map((height, index) => <Bar key={index} $height={height} $played={progress > index / BARS.length} />)}</Bars>
          <Seek type="range" min={0} max={duration || 1} step="0.1" value={Math.min(time, duration || 0)} disabled={!duration} aria-label={`موقعیت پخش ${track.title || "صدا"}`} aria-valuetext={`${formatAudioTime(time)} از ${formatAudioTime(duration)}`} onChange={(event) => { const n = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = n; setTime(n); }} />
        </Wave>
        <Meta><span dir="ltr">{formatAudioTime(time)} / {duration > 0 ? formatAudioTime(duration) : "--:--"}</span><Speed type="button" aria-label={`سرعت پخش ${rate} برابر؛ تغییر سرعت`} onClick={() => { const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1; if (audioRef.current) audioRef.current.playbackRate = next; setRate(next); }}>{rate}×</Speed></Meta>
      </Main>
    </PlayerRow>
    {error && <Status role="status">{error} <a href={track.audioUrl} target="_blank" rel="noopener noreferrer">باز کردن فایل</a></Status>}
    {!track.audioUrl && <Status>از بخش محتوا، فایل صوتی بارگذاری کنید یا صدای خود را ضبط کنید.</Status>}
  </>;
}

export function AudioBlock({ block, mode, selectedElementId, onSelectElement, onUpdateContent }: BlockComponentProps) {
  const isEditor = mode === "editor";
  const data = block.data ?? {};
  const tracks = normalizeAudioTracks(data.tracks).filter((track) => track.enabled && (isEditor || track.audioUrl));
  if (!isEditor && tracks.length === 0) return null;
  const displayTracks = tracks.length ? tracks : [{ id: "empty", title: "اولین پیام صوتی شما", caption: "", audioUrl: "", enabled: true }];
  const parts = { instanceId: block.instanceId, mode, selectedElementId, onSelectElement };
  const style = (id: string) => responsiveStyleToCss(block.elements?.[id]?.style, "audio", { mobileOnly: isEditor, effect: "none" });
  return <EditablePart {...parts} elementId="container"><Root $css={style("container")} dir={block.settings?.direction === "ltr" ? "ltr" : "rtl"}>
    {data.showTitle !== false && (isEditor || Boolean(data.title)) && <EditablePart {...parts} elementId="title"><Heading $css={style("title")}><InlineEditableText value={String(data.title ?? "")} dataKey="title" instanceId={block.instanceId} mode={mode} onUpdateContent={onUpdateContent}>{(text) => text || (isEditor ? "عنوان بخش صوتی" : "")}</InlineEditableText></Heading></EditablePart>}
    {data.showDescription === true && <EditablePart {...parts} elementId="description"><Description $css={style("description")}><InlineEditableText value={String(data.description ?? "")} dataKey="description" instanceId={block.instanceId} mode={mode} onUpdateContent={onUpdateContent} multiline>{(text) => text}</InlineEditableText></Description></EditablePart>}
    <List>{displayTracks.map((track, index) => <EditablePart {...parts} elementId="item" key={`${track.id}-${index}`}><Card $css={style("item")}>
      <VoicePlayer key={track.audioUrl} track={track} buttonCss={style("button")} editButton={(child) => <EditablePart {...parts} elementId="button">{child}</EditablePart>} />
      {track.caption && <EditablePart {...parts} elementId="caption"><Caption $css={style("caption")}>{track.caption}</Caption></EditablePart>}
    </Card></EditablePart>)}</List>
  </Root></EditablePart>;
}
