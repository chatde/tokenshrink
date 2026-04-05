import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs tracking-[0.25em] uppercase text-savings/60 mb-4 font-mono">
        404
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight text-text mb-4">
        Page not found
      </h1>
      <p className="text-text-secondary mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
      >
        Back to Home
      </Link>
    </div>
  );
}
