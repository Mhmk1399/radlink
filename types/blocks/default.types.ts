export type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};

export type AnimationType =
  | "none"
  | "fade"
  | "slideUp"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "pulse"
  | "bounceIn"
  | "rotateIn"
  | "blurIn"
  | "slideDown"
  | "zoomOut"
  | "flipUp"
  | "flipSide"
  | "swingIn"
  | "elasticIn"
  | "riseSoft"
  | "dropSoft"
  | "focusIn"
  | "glowIn";

export type EditableStyleKey =
  | "color"
  | "backgroundColor"
  | "fontSize"
  | "height"
  | "textAlign"
  | "contentAlign"
  | "marginTop"
  | "marginBottom"
  | "paddingTop"
  | "paddingBottom"
  | "borderRadius"
  | "borderColor"
  | "borderWidth"
  | "gridColumns"
  | "shadow"
  | "animation";

export type ShadowStyleValue = {
  color?: string;
  intensity?: number;
};

export type TextAlignValue = "left" | "center" | "right";
export type ContentAlignValue = "left" | "center" | "right";

export type EditableStyleMap = {
  color?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<number>;
  height?: ResponsiveValue<number>;
  textAlign?: ResponsiveValue<TextAlignValue>;
  contentAlign?: ResponsiveValue<ContentAlignValue>;
  marginTop?: ResponsiveValue<number>;
  marginBottom?: ResponsiveValue<number>;
  paddingTop?: ResponsiveValue<number>;
  paddingBottom?: ResponsiveValue<number>;
  borderRadius?: ResponsiveValue<number>;
  borderColor?: ResponsiveValue<string>;
  borderWidth?: ResponsiveValue<number>;
  gridColumns?: ResponsiveValue<number>;
  shadow?: ResponsiveValue<ShadowStyleValue>;
  animation?: AnimationType;
};

export type BlockElement = {
  label: string;
  style: EditableStyleMap;
  allowedStyleKeys: EditableStyleKey[];
};

export type BannerData = {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  imageLink: string;
  showButton: boolean;
  showOverlay: boolean;
};

export type BannerElementId =
  "container" | "overlay" | "title" | "description" | "button";

export type PageBlock = {
  instanceId: string;
  blockId?: string;
  type: "banner";
  version: number;
  order: number;
  isActive: boolean;
  data: BannerData;
  settings: {
    direction?: "rtl" | "ltr";
    [key: string]: unknown;
  };
  elements: Record<BannerElementId, BlockElement>;
};

export type EditorMode = "editor" | "preview" | "public";

export type BannerBlockProps = {
  block: PageBlock;
  mode: EditorMode;
  selectedElementId?: string | null;
  onSelectElement?: (
    instanceId: string,
    elementId: string,
    options?: { centerBlock?: boolean },
  ) => void;
  onUpdateContent?: (instanceId: string, key: string, value: unknown) => void;
};

export type BannerContentFieldType =
  "text" | "textarea" | "url" | "image" | "boolean";

export type BannerContentField = {
  key: keyof BannerData;
  label: string;
  type: BannerContentFieldType;
};

export type BannerSchema = {
  type: "banner";
  label: string;
  description: string;
  elements: Record<
    BannerElementId,
    {
      label: string;
      allowedStyleKeys: EditableStyleKey[];
    }
  >;
  contentFields: BannerContentField[];
};
