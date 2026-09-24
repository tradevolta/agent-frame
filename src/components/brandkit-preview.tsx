// Static HTML mock-ups of Brand Kit graphics for the marketing pages.
function Avatar({ size }: { size: number }) {
  return (
    <div className="grid place-items-center rounded-full border-4 border-[#f7f5f2] bg-gradient-to-b from-stone-300 to-stone-500" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden>
        <circle cx="50" cy="38" r="18" fill="#1f2a44" opacity="0.6" />
        <path d="M18 100c2-24 16-36 32-36s30 12 32 36z" fill="#1f2a44" opacity="0.7" />
      </svg>
    </div>
  );
}

function Post({ headline, line, color }: { headline: string; line: string; color: string }) {
  return (
    <div className="card overflow-hidden text-center shadow-sm">
      <div className="px-3 pb-10 pt-5 text-white" style={{ background: color }}>
        <div className="text-lg font-extrabold tracking-widest">{headline}</div>
      </div>
      <div className="-mt-8 flex justify-center"><Avatar size={64} /></div>
      <div className="px-3 pb-4 pt-2">
        <div className="text-xs font-semibold">412 Oak Hollow Dr, Wake Forest</div>
        <div className="text-[11px]" style={{ color }}>{line}</div>
        <div className="mt-2 text-[11px] font-semibold">Jordan Ellis</div>
        <div className="text-[10px] text-muted">REALTOR® • Your Brokerage</div>
      </div>
    </div>
  );
}

export function BrandKitPreview() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Post headline="JUST LISTED" line="$489,000 • 4 bd • 3 ba" color="#1f2a44" />
      <Post headline="OPEN HOUSE" line="Sat 1–3 PM" color="#6b1f2e" />
      <Post headline="UNDER CONTRACT" line="Congrats to my buyers!" color="#1f5f5b" />
      <Post headline="JUST SOLD" line="$512,500" color="#c08a2e" />
    </div>
  );
}
