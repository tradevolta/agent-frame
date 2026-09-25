"use client";
import Link from "next/link";
import { useState } from "react";

export function FreeTool() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/free-graphic", { method: "POST", body: new FormData(e.currentTarget) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setUrl(data.url);
    else setError(data.error || "Something went wrong");
    setBusy(false);
  }

  return (
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="fn">Your name</label><input id="fn" name="fullName" required className="input" /></div>
          <div><label className="label" htmlFor="br">Brokerage</label><input id="br" name="brokerage" required className="input" /></div>
          <div><label className="label" htmlFor="ph">Phone</label><input id="ph" name="phone" className="input" /></div>
          <div><label className="label" htmlFor="pr">Price</label><input id="pr" name="price" className="input" placeholder="$489,000" /></div>
        </div>
        <div><label className="label" htmlFor="ad">Property address</label><input id="ad" name="address" className="input" placeholder="412 Oak Hollow Dr, Wake Forest" /></div>
        <div><label className="label" htmlFor="pf">Your photo</label><input id="pf" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="input" /></div>
        <div><label className="label" htmlFor="em">Email (we&apos;ll send you a copy)</label><input id="em" name="email" type="email" required className="input" /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create my free graphic"}</button>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <p className="text-xs text-muted">By continuing you agree to receive occasional marketing tips. Unsubscribe anytime.</p>
      </form>
      <div className="card grid place-items-center bg-paper p-6">
        {url ? (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Your Just Listed graphic" className="mx-auto max-h-[520px] rounded-lg shadow-md" />
            <a href={url} download="just-listed.png" className="btn-primary mt-4">Download</a>
            <p className="mt-4 text-sm text-muted">Want it without the watermark, with a studio headshot and 7 more templates? <Link href="/#pricing" className="font-medium text-accent underline">Get Agent Pro</Link></p>
          </div>
        ) : (
          <p className="text-center text-muted">Your graphic will appear here.</p>
        )}
      </div>
    </div>
  );
}
