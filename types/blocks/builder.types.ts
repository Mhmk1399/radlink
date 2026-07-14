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

export type EditorMode = "editor" | "preview" | "public";

export type PageBlock = {
  instanceId: string;
  hidden?: boolean;

  blockId?: string;
  type: string;
  version: number;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
  settings: {
    direction?: "rtl" | "ltr";
    [key: string]: unknown;
  };
  elements: Record<string, BlockElement>;
};

export type ContentFieldType =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "video"
  | "boolean"
  | "datetime"
  | "color"
  | "repeater"
  | "select";

export type SelectFieldConfig = {
  key: string;
  label: string;
  type: "select";
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
};

export type MessengerLinkPreset =
  | "telegram"
  | "instagram"
  | "whatsapp"
  | "eitaa"
  | "soroush"
  | "rubika"
  | "bale"
  | "igap"
  | "signal"
  | "messenger"
  | "discord"
  | "x"
  | "youtube"
  | "linkedin";

// اضافه کن — تایپ فیلد repeater
export type RepeaterFieldConfig = {
  key: string;
  label: string;
  type: "repeater";
  itemLabel?: string;
  addLabel?: string;
  maxItems?: number;
  fields: ReadonlyArray<{
    key: string;
    label: string;
    type:
      | "text"
      | "textarea"
      | "boolean"
      | "url"
      | "image"
      | "color"
      | "select";
    options?: ReadonlyArray<{
      value: string;
      label: string;
    }>;
    defaultValue?: unknown;
    linkPreset?: MessengerLinkPreset;
    linkPresetFromField?: string;
  }>;
};

export type ContentField =
  | {
    key: string;
    label: string;
    type: Exclude<ContentFieldType, "repeater" | "select">;
    linkPreset?: MessengerLinkPreset;
  }
  | RepeaterFieldConfig
  | SelectFieldConfig;

export type BlockSchema = {
  type: string;
  label: string;
  description: string;
  elements: Record<
    string,
    {
      label: string;
      allowedStyleKeys: EditableStyleKey[];
    }
  >;
  contentFields: readonly ContentField[];
};

export type BlockComponentProps = {
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
