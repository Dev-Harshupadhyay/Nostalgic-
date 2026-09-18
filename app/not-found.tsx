import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl" aria-hidden>
        📻
      </p>
      <h1 className="text-xl font-bold">This track doesn&apos;t exist</h1>
      <p className="text-sm text-white/55">
        The page you were looking for isn&apos;t here. Let&apos;s get you back to the music.
      </p>
      <Link href="/" className="btn btn-glow px-6 py-3 text-sm">
        Back to Home
      </Link>
    </div>
  );
}
