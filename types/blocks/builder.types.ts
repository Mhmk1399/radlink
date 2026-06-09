export type ResponsiveValue<T> = {
    mobile?: T;
    tablet?: T;
    desktop?: T;
};

export type AnimationType =
    | "none"
    | "fade"
    | "slideUp"
    | "scale"
    | "pulse";

export type EditableStyleKey =
    | "color"
    | "backgroundColor"
    | "fontSize"
    | "borderRadius"
    | "borderColor"
    | "borderWidth"
    | "animation";

export type EditableStyleMap = {
    color?: ResponsiveValue<string>;
    backgroundColor?: ResponsiveValue<string>;
    fontSize?: ResponsiveValue<number>;
    borderRadius?: ResponsiveValue<number>;
    borderColor?: ResponsiveValue<string>;
    borderWidth?: ResponsiveValue<number>;
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
        type: "text" | "textarea" | "boolean" | "url" | "image";
    }>;
};

export type ContentField =
    | {
        key: string;
        label: string;
        type: Exclude<ContentFieldType, "repeater" | "select">;
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
    onSelectElement?: (instanceId: string, elementId: string) => void;
    onUpdateContent?: (
        instanceId: string,
        key: string,
        value: string
    ) => void;
};