import { brand } from "@/lib/brand";

export const FAQS: { q: string; a: string }[] = [
  { q: "Will the headshots actually look like me?", a: "We train a private AI model on your own photos and tune it for natural skin texture and true-to-life features, not an airbrushed look. You also get free redos on any style, and if none of your photos work for you, we refund you in full." },
  { q: "What photos do I need to upload?", a: "10–20 recent selfies or casual photos: only you in the frame, different angles, lighting and outfits, no sunglasses or filters. It takes about 10 minutes." },
  { q: "How long does it take?", a: "Usually about an hour after you upload. We email you when your headshots are ready." },
  { q: "Can I use these on MLS, Zillow and my business cards?", a: "Yes. You get full commercial use. Our Classic Studio, Bright White and Brand Color styles use plain backgrounds most brokerages and MLS profiles accept. Always check your brokerage's policy." },
  { q: "What's in the Brand Kit?", a: "Ready-to-post Just Listed, Open House, Under Contract, Just Sold and Coming Soon graphics, plus a business card, email signature and LinkedIn/Facebook cover, all with your new headshot, brand color and brokerage name." },
  { q: "What happens to my selfies?", a: `Your uploaded selfies are deleted automatically 7 days after your order. We never sell your data or use your photos to train models for anyone else. Questions: ${brand.supportEmail}.` },
  { q: "Do you do brokerage or team orders?", a: "Yes. Buy seats for your office, share one invite link, and every agent gets their own private studio with a matching team backdrop. Managers get a dashboard to see who's done." },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <h2 className="text-center font-display text-4xl font-semibold">Questions agents ask</h2>
      <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-card">
        {FAQS.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {f.q}
              <span className="text-muted transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
