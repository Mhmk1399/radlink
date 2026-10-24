"use client";

import { useState } from "react";
import styled from "styled-components";
import { HiOutlinePhoto } from "react-icons/hi2";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import { responsiveStyleToCss, sharedBlockKeyframes } from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps, EditableStyleMap } from "@/types/blocks/builder.types";

type GalleryImage = { id: string; imageUrl: string; altText: string; caption: string; enabled: boolean };

const Container = styled.section<{ $css: string }>`
  ${sharedBlockKeyframes("gallery")}
  width: 100%;
  min-width: 0;
  padding-inline: 16px;
  ${(p) => p.$css}
`;
const Heading = styled.h2<{ $css: string }>`
  margin: 0 0 8px;
  font-weight: 800;
  line-height: 1.6;
  overflow-wrap: anywhere;
  ${(p) => p.$css}
`;
const Description = styled.p<{ $css: string }>`
  margin: 0 0 16px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  ${(p) => p.$css}
`;
const Grid = styled.div<{ $css: string; $columnsCss: string; $gap: number }>`
  display: grid;
  gap: ${(p) => p.$gap}px;
  margin-top: 16px;
  min-width: 0;
  > * { min-width: 0; }
  ${(p) => p.$css}
  ${(p) => p.$columnsCss}
`;
const ImageFrame = styled.div<{ $css: string }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 180px;
  border-radius: 16px;
  background: #ebf2fa;
  ${(p) => p.$css}
`;
const Photo = styled.img<{ $fit: "cover" | "contain" }>`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: ${(p) => p.$fit};
`;
const Placeholder = styled.div`
  display: flex;
  height: 100%;
  min-height: 64px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  color: #427aa1;
  text-align: center;
  font-size: 12px;
  line-height: 1.8;
  box-shadow: inset 0 0 0 1px rgba(66, 122, 161, 0.15);
  border-radius: inherit;
`;
const Caption = styled.div<{ $css: string }>`
  padding: 8px 2px 0;
  line-height: 1.8;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  ${(p) => p.$css}
`;

function GalleryPhoto({ image, fit, isEditor }: { image: GalleryImage; fit: "cover" | "contain"; isEditor: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!image.imageUrl || failedUrl === image.imageUrl) {
    return <Placeholder role={failedUrl ? "img" : undefined} aria-label={failedUrl ? image.altText || "تصویر در دسترس نیست" : undefined}>
      <HiOutlinePhoto size={28} aria-hidden="true" />
      <span>{failedUrl ? "تصویر در دسترس نیست" : "تصویر خود را اضافه کنید"}</span>
      {isEditor && <span>از بخش تصاویر گالری، تصویر را بارگذاری کنید.</span>}
    </Placeholder>;
  }
  return <Photo src={image.imageUrl} alt={image.altText} $fit={fit} loading="lazy" decoding="async" onError={() => setFailedUrl(image.imageUrl)} />;
}

export function galleryColumnsCss(style: EditableStyleMap | undefined, mobileOnly: boolean): string {
  const clamp = (value: unknown, fallback: number) => {
    if (value === undefined || value === null || value === "") return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(4, Math.max(1, Math.round(n))) : fallback;
  };
  const mobile = clamp(style?.gridColumns?.mobile, 2);
  const tablet = clamp(style?.gridColumns?.tablet, mobile);
  const desktop = clamp(style?.gridColumns?.desktop, tablet);
  return `grid-template-columns: repeat(${mobile}, minmax(0, 1fr));${mobileOnly ? "" : `
    @media (min-width: 768px) { grid-template-columns: repeat(${tablet}, minmax(0, 1fr)); }
    @media (min-width: 1024px) { grid-template-columns: repeat(${desktop}, minmax(0, 1fr)); }
  `}`;
}

export function GalleryBlock({ block, mode, selectedElementId, onSelectElement, onUpdateContent }: BlockComponentProps) {
  const isEditor = mode === "editor";
  const data = block.data ?? {};
  const images: GalleryImage[] = Array.isArray(data.images) ? data.images.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    const rawUrl = typeof entry.imageUrl === "string" ? entry.imageUrl.trim() : "";
    const imageUrl = /^(https?:\/\/|\/(?!\/))/i.test(rawUrl) ? rawUrl : "";
    return [{ id: String(entry.id ?? `image-${index}`), imageUrl, altText: String(entry.altText ?? ""), caption: String(entry.caption ?? ""), enabled: entry.enabled !== false }];
  }) : [];
  const visibleImages = images.filter((image) => image.enabled && (isEditor || image.imageUrl));
  if (!isEditor && visibleImages.length === 0) return null;
  const displayImages = visibleImages.length ? visibleImages : [{ id: "gallery-empty", imageUrl: "", altText: "", caption: "", enabled: true }];
  const partProps = { instanceId: block.instanceId, mode, selectedElementId, onSelectElement };
  const style = (id: string) => responsiveStyleToCss(block.elements?.[id]?.style, "gallery", { mobileOnly: isEditor, effect: "none" });
  const gap = [0, 8, 16, 24].includes(Number(data.spacing)) ? Number(data.spacing) : 16;
  const fit = data.imageFit === "contain" ? "contain" : "cover";

  return <EditablePart {...partProps} elementId="container">
    <Container $css={style("container")} dir={block.settings?.direction === "ltr" ? "ltr" : "rtl"}>
      {data.showTitle !== false && (isEditor || Boolean(data.title)) && <EditablePart {...partProps} elementId="title">
        <Heading $css={style("title")}><InlineEditableText value={String(data.title ?? "")} dataKey="title" instanceId={block.instanceId} mode={mode} onUpdateContent={onUpdateContent}>{(text) => text || (isEditor ? "عنوان گالری" : "")}</InlineEditableText></Heading>
      </EditablePart>}
      {data.showDescription === true && <EditablePart {...partProps} elementId="description">
        <Description $css={style("description")}><InlineEditableText value={String(data.description ?? "")} dataKey="description" instanceId={block.instanceId} mode={mode} onUpdateContent={onUpdateContent} multiline>{(text) => text || (isEditor ? "توضیحات گالری" : "")}</InlineEditableText></Description>
      </EditablePart>}
      <EditablePart {...partProps} elementId="grid">
        <Grid $css={style("grid")} $columnsCss={galleryColumnsCss(block.elements?.grid?.style, isEditor)} $gap={gap}>
          {displayImages.map((image, index) => <figure key={`${image.id}-${index}`} style={{ margin: 0, minWidth: 0 }}>
            <EditablePart {...partProps} elementId="image"><ImageFrame $css={style("image")}><GalleryPhoto image={image} fit={fit} isEditor={isEditor} /></ImageFrame></EditablePart>
            {data.showCaptions !== false && Boolean(image.caption) && <figcaption><EditablePart {...partProps} elementId="caption"><Caption $css={style("caption")}>{image.caption}</Caption></EditablePart></figcaption>}
          </figure>)}
        </Grid>
      </EditablePart>
    </Container>
  </EditablePart>;
}
