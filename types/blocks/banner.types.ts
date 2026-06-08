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

export type BannerData = {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    imageUrl: string;
    showButton: boolean;
    showOverlay: boolean;
};

export type BannerElementId =
    | "container"
    | "overlay"
    | "title"
    | "description"
    | "button";

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
    onSelectElement?: (instanceId: string, elementId: string) => void;
    onUpdateContent?: (
        instanceId: string,
        key: string,
        value: string
    ) => void;
};

export type BannerContentFieldType =
    | "text"
    | "textarea"
    | "url"
    | "image"
    | "boolean";

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