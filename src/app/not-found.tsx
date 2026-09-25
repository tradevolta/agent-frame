import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-2 text-muted">If you&apos;re looking for your studio, use the link in your confirmation email.</p>
      <Link href="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
