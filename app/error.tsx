"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 font-serif text-3xl text-[#2d2a24]">出错了</h1>
      <p className="mb-8 text-sm text-[#7a746e]">
        抱歉，页面加载出现了问题
      </p>
      <button
        onClick={reset}
        className="rounded-sm bg-[#c9a96e] px-8 py-2.5 text-sm text-white transition-colors hover:bg-[#a8884a]"
      >
        重试
      </button>
    </div>
  );
}
