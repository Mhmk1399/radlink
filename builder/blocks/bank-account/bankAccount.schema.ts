import type { BlockSchema } from "@/types/blocks/builder.types";

export const bankAccountSchema: BlockSchema = {
  type: "bankAccount",

  label: "اطلاعات بانکی",

  description:
    "نمایش شماره کارت، شماره شبا و شماره حساب با امکان کپی سریع اطلاعات",

  contentFields: [
    {
      key: "holderName",
      label: "نام صاحب حساب",
      type: "text",
    },

    {
      key: "bankName",
      label: "نام بانک",
      type: "text",
    },

    {
      key: "cardNumber",
      label: "شماره کارت",
      type: "text",
    },

    {
      key: "shebaNumber",
      label: "شماره شبا",
      type: "text",
    },

    {
      key: "accountNumber",
      label: "شماره حساب",
      type: "text",
    },

    {
      key: "showHolderName",
      label: "نمایش نام صاحب حساب",
      type: "boolean",
    },

    {
      key: "showBankName",
      label: "نمایش نام بانک",
      type: "boolean",
    },
  ],

  elements: {
    container: {
      label: "کادر اصلی",
      allowedStyleKeys: [
        "backgroundColor",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    ownerName: {
      label: "صاحب حساب",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    holderName: {
      label: "نام صاحب حساب",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    bankName: {
      label: "نام بانک",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    cardNumber: {
      label: "شماره کارت",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    shebaNumber: {
      label: "شماره شبا",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    accountNumber: {
      label: "شماره حساب",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    item: {
      label: "ردیف اطلاعات",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    icon: {
      label: "آیکون",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    label: {
      label: "عنوان فیلد",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "animation",
      ],
    },

    value: {
      label: "شماره / مقدار",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },

    copyButton: {
      label: "دکمه کپی",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },
  },
};