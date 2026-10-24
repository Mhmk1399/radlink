"use client";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiOutlineBars3, HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi2";
import { sortContactItems } from "@/builder/blocks/contact-info/contactInfo.order";

type ContactRow = {
  id: string;
  type: string;
  label: string;
  value: string;
  visible: boolean;
  displayOrder?: unknown;
  sourcePriority: number;
  itemOrder: number;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const labels: Record<string, string> = {
  phone: "تلفن", landline: "تلفن ثابت", whatsapp: "واتساپ", email: "ایمیل", address: "آدرس", link: "لینک",
};

export function getContactOrderRows(data: Record<string, unknown>): ContactRow[] {
  const rows: ContactRow[] = ["phone", "whatsapp", "email", "address"].map((type, index) => ({
    id: type, type,
    label: text(data[`${type}Label`]) || labels[type],
    value: text(data[type]),
    visible: Boolean(data[`show${type[0].toUpperCase()}${type.slice(1)}`]) && Boolean(text(data[type])),
    displayOrder: data[`${type}Order`], sourcePriority: 0, itemOrder: index,
  }));
  if (Array.isArray(data.contactItems)) {
    data.contactItems.forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return;
      const type = labels[text(item.type)] ? text(item.type) : "phone";
      rows.push({
        id: `extra-${text(item.id) || `contact-${index}`}`, type,
        label: text(item.label) || labels[type], value: text(item.value),
        visible: item.enabled !== false && Boolean(text(item.value)),
        displayOrder: item.displayOrder, sourcePriority: 1, itemOrder: index,
      });
    });
  }
  return sortContactItems(rows, data.contactOrder);
}

function SortableContact({ row, first, last, move }: {
  row: ContactRow; first: boolean; last: boolean; move: (offset: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <li ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, position: "relative", zIndex: isDragging ? 10 : undefined }}
      className={`flex items-center gap-2 rounded-xl border bg-white p-2.5 ${isDragging ? "border-blue-400 shadow-lg" : "border-neutral-200"}`}
    >
      <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
        aria-label={`جابجایی ${row.label}`}
        className="touch-none cursor-grab rounded-lg p-2 text-neutral-500 focus-visible:outline-2 focus-visible:outline-blue-500 active:cursor-grabbing">
        <HiOutlineBars3 size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-neutral-700">{row.label}</p>
        <p className="truncate text-[11px] text-neutral-500">{row.value || "بدون مقدار"}</p>
        {!row.visible && <p className="text-[10px] text-neutral-400">در صفحه نمایش داده نمی‌شود</p>}
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" disabled={first} onClick={() => move(-1)} aria-label={`انتقال ${row.label} به بالا`}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-25"><HiOutlineChevronUp /></button>
        <button type="button" disabled={last} onClick={() => move(1)} aria-label={`انتقال ${row.label} به پایین`}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-25"><HiOutlineChevronDown /></button>
      </div>
    </li>
  );
}

export function ContactOrderField({ data, onChange }: {
  data: Record<string, unknown>; onChange: (key: string, value: unknown) => void;
}) {
  const rows = getContactOrderRows(data);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const move = (from: number, to: number) => {
    if (from < 0 || to < 0 || to >= rows.length || from === to) return;
    onChange("contactOrder", arrayMove(rows, from, to).map(row => row.id));
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) move(rows.findIndex(row => row.id === active.id), rows.findIndex(row => row.id === over.id));
  };
  return (
    <div dir="rtl" className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5">
      <h4 className="text-[13px] font-bold text-neutral-700">ترتیب راه‌های ارتباطی</h4>
      <p className="text-[11px] leading-5 text-neutral-500">آیتم‌ها را از دستگیره بکشید یا با فلش‌ها جابه‌جا کنید. ترتیب بالا به پایین در صفحه اعمال می‌شود.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map(row => row.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2" aria-label="ترتیب راه‌های ارتباطی">
            {rows.map((row, index) => <SortableContact key={row.id} row={row} first={index === 0} last={index === rows.length - 1} move={offset => move(index, index + offset)} />)}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
