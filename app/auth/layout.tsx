import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand showcase */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#2d2a24] lg:flex">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('/images/auth/bg.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 text-center">
          <h1 className="font-serif text-5xl tracking-[0.15em] text-white">
            LUXE
          </h1>
          <p className="mt-4 text-sm tracking-[0.3em] text-[#c9a96e]">
            轻奢 · 不张扬
          </p>
          <div className="mx-auto mt-8 h-px w-12 bg-[#c9a96e]/50" />
          <p className="mt-8 text-sm leading-relaxed text-white/60">
            精致女装，开启您的优雅之旅
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full items-center justify-center bg-[#faf8f5] px-4 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="font-serif text-2xl text-[#2d2a24]">
              LUXE
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
