"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs tracking-[0.25em] uppercase text-savings/60 mb-4 font-mono">
        Error
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight text-text mb-4">
        Something went wrong
      </h1>
      <p className="text-text-secondary mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="inline-block px-8 py-3 bg-savings text-bg font-semibold rounded-lg hover:bg-savings/90 transition-all text-sm"
      >
        Try Again
      </button>
    </div>
  );
}
