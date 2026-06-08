"use server";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/data/db";
import Page from "@/models/pages";
import PageRenderer from "./PageRenderer";

type Props = {
  params: Promise<{ url: string }>;
};

export default async function PageRoute({ params }: Props) {
  const { url } = await params;

  await connectDB();

  const page = await Page.findOne({ url }).lean();
  console.log(page)

  if (!page) return notFound();

  return (
    <div className="w-full px-2 pt-2 pb-10 bg-white">
      <header
        className="mb-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm"
        dir="rtl"
      >
        <h1 className="text-4xl font-bold text-neutral-900">{page.title}</h1>
        {page.description && (
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {page.description}
          </p>
        )}
      </header>

      <section className="space-y-6 overflow-hidden">
        <PageRenderer blocks={page.blocks ?? []} />
      </section>
    </div>
  );
}
