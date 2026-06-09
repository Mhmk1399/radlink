"use client";

import dynamic from "next/dynamic";

function MinimalLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Logo icon */}
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30" />

        {/* Loading circle */}
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-slate-700 border-t-violet-500" />

        {/* Text */}
        <div>
          <h1 className="text-xl font-semibold tracking-wide text-white sm:text-2xl">
            در حال بارگذاری صفحه‌ساز...
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
            لطفاً صبر کنید
          </p>
        </div>
      </div>

      {/* Background blur (subtle only) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_60%)]" />
    </div>
  );
}

const SimplePageBuilder = dynamic(
  () => import("@/builder/editor/PageBuilder"),
  {
    ssr: false,
    loading: () => <MinimalLoadingScreen />,
  },
);

export default function TestBannerPage() {
  return <SimplePageBuilder />;
}
