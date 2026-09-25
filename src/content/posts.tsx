import Link from "next/link";
import type { ReactNode } from "react";

// Evergreen SEO guides. Each targets a search realtors actually make and ends
// with a soft call to action. Content is general information, not legal advice.

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  body: () => ReactNode;
}

const Cta = () => (
  <p>
    Ready for a new headshot without booking a photographer?{" "}
    <Link href="/#pricing">Get studio-quality realtor headshots in about an hour</Link>.
  </p>
);

export const POSTS: Post[] = [
  {
    slug: "realtor-headshot-tips",
    title: "Realtor Headshot Tips: 12 Rules for a Photo That Gets Calls",
    description: "What makes a real estate agent headshot work on Zillow, MLS and yard signs: framing, wardrobe, background, expression and how often to update.",
    date: "2026-09-20",
    readMinutes: 6,
    body: () => (
      <>
        <p>Your headshot is the first thing a buyer or seller sees on Zillow, Realtor.com, your Google Business Profile and every flyer. It shows up long before you get a chance to talk. Here are the rules that matter most.</p>
        <h2>1. Look like you do today</h2>
        <p>Clients meet you in person. If your photo is ten years or twenty pounds out of date, the first meeting starts with a small breach of trust. Update at least every two years, or whenever your hair or look changes noticeably.</p>
        <h2>2. Head and shoulders, eyes in the top third</h2>
        <p>Portals crop your photo into small circles and squares. Tight framing (top of the head to mid-chest) keeps your face readable at thumbnail size.</p>
        <h2>3. Sharp eyes, genuine smile</h2>
        <p>Viewers look at eyes first. A slight, genuine smile reads as approachable. A forced grin or a stern look reads as salesy or cold.</p>
        <h2>4. Solid, simple wardrobe</h2>
        <p>Solid colors in navy, charcoal, burgundy or jewel tones photograph best. Avoid busy patterns, logos and anything you wouldn&apos;t wear to a listing appointment.</p>
        <h2>5. Match your market</h2>
        <p>A luxury agent in a downtown market and a rural land specialist shouldn&apos;t look identical. Coastal, suburban and urban agents can all choose a background that hints at where they work.</p>
        <h2>6. Keep one plain-background version</h2>
        <p>Many brokerages and some MLS profiles prefer a neutral or white background. Keep one version on file even if you use lifestyle shots on social media.</p>
        <h2>7. Use the same photo everywhere</h2>
        <p>Consistency builds recognition. Use the same primary headshot on MLS, Zillow, Google, email signature, business cards and social profiles.</p>
        <h2>8. Mind the lighting</h2>
        <p>Soft, even light flatters everyone. Avoid harsh overhead light and strong shadows under the eyes.</p>
        <h2>9. Skip heavy retouching</h2>
        <p>Remove stray hairs and blemishes, but keep your real skin texture. Over-smoothed photos look fake and hurt trust.</p>
        <h2>10. Have a few variations</h2>
        <p>One formal, one friendly, one outdoor. Different platforms and posts call for different moods.</p>
        <h2>11. Put your brand around it</h2>
        <p>A headshot on its own is a photo. A headshot inside consistent Just Listed, Open House and Sold graphics becomes a personal brand people remember.</p>
        <h2>12. Always include your brokerage in ads</h2>
        <p>Most state real estate commissions require your firm&apos;s name in advertising. Build it into every graphic you post (see our <Link href="/blog/nc-real-estate-advertising-rules">NC advertising guide</Link>).</p>
        <Cta />
      </>
    ),
  },
  {
    slug: "ai-headshots-vs-photographer",
    title: "AI Headshots vs. a Photographer: An Honest Comparison for Real Estate Agents",
    description: "Cost, time, quality and when you should still book a real photographer. A practical comparison for busy agents.",
    date: "2026-09-18",
    readMinutes: 5,
    body: () => (
      <>
        <p>AI headshots went from novelty to normal in a few years. Are they right for a real estate agent, whose face is their brand? Here&apos;s an honest breakdown.</p>
        <h2>Cost</h2>
        <p>A professional headshot session usually costs a few hundred dollars once you add styling, extra looks and retouching. An AI headshot package typically costs $29-$49 and includes dozens of looks.</p>
        <h2>Time</h2>
        <p>A photographer means scheduling, travel, the shoot and a wait for edits, often one to two weeks in total. AI takes about 10 minutes of selfies and roughly an hour of processing.</p>
        <h2>Variety</h2>
        <p>AI gives you many backgrounds and outfits from one set of selfies, like studio, office, front porch and coastal. That variety is useful for social media, where the same photo every week gets stale.</p>
        <h2>Where photographers still win</h2>
        <ul>
          <li>Team photos where people need to interact in one frame</li>
          <li>Full-body or lifestyle shoots for billboards and print campaigns</li>
          <li>Agents who want creative direction in person</li>
        </ul>
        <h2>The quality question</h2>
        <p>The risk with AI is photos that don&apos;t quite look like you. Clients notice when they meet you. Choose a service that trains on your own photos, favors natural skin texture over airbrushing, and offers free redos. Then pick only the shots that truly look like you.</p>
        <h2>Our take</h2>
        <p>For most agents, AI is the practical choice for day-to-day branding. Refresh every six months, use the variety on social media, and save the photographer budget for a big campaign.</p>
        <Cta />
      </>
    ),
  },
  {
    slug: "nc-real-estate-advertising-rules",
    title: "North Carolina Real Estate Advertising Basics for Your Headshot & Social Posts",
    description: "A plain-English overview of what NC brokers should include in ads and social graphics, like the firm name and clear contact info.",
    date: "2026-09-15",
    readMinutes: 4,
    body: () => (
      <>
        <p><em>This is general information, not legal advice. Always confirm current rules with the <a href="https://www.ncrec.gov" rel="noopener noreferrer" target="_blank">North Carolina Real Estate Commission (NCREC)</a> and your broker-in-charge.</em></p>
        <h2>Include your firm&apos;s name</h2>
        <p>NCREC rules on advertising generally require that ads placed by a broker include the name of the firm the broker is affiliated with. That covers Just Listed posts, Open House flyers, social media graphics and paid ads. A graphic with only your name and cell number is a common mistake.</p>
        <h2>Don&apos;t imply you are the firm</h2>
        <p>Your personal brand can be prominent, but it shouldn&apos;t suggest that you are an independent company if you&apos;re not. Keep the brokerage name clearly visible.</p>
        <h2>Advertise listings with permission</h2>
        <p>Only advertise a property with the owner&apos;s consent and within the terms of your listing agreement. Coordinate with the listing agent for co-op marketing.</p>
        <h2>Keep claims accurate</h2>
        <p>Prices, square footage and features in your graphics should match the listing. Update or remove posts when the status changes.</p>
        <h2>How we help</h2>
        <p>Every Brand Kit graphic we generate automatically prints your brokerage name next to your name, so you can&apos;t forget it.</p>
        <Cta />
      </>
    ),
  },
  {
    slug: "how-to-take-selfies-for-ai-headshots",
    title: "How to Take Selfies for AI Headshots (The 10-Minute Guide)",
    description: "The exact photos to upload for realistic AI headshots: angles, lighting, variety and what to avoid.",
    date: "2026-09-12",
    readMinutes: 3,
    body: () => (
      <>
        <p>Your AI headshots can only be as good as the photos you upload. Ten minutes of prep makes a big difference.</p>
        <h2>Upload 10-20 recent photos</h2>
        <ul>
          <li>Only you in the frame, with no group shots or other faces</li>
          <li>Taken in the last few months, with your current hair and look</li>
          <li>A mix of close-ups and head-and-shoulders shots</li>
          <li>Different angles: straight on, slightly left and slightly right</li>
          <li>Different lighting and backgrounds (indoors, outdoors, near a window)</li>
          <li>A few different outfits</li>
        </ul>
        <h2>Avoid</h2>
        <ul>
          <li>Sunglasses, hats or hands covering your face</li>
          <li>Heavy filters and beauty modes</li>
          <li>Blurry or very dark photos</li>
          <li>Extreme expressions. Mostly smile the way you do with clients</li>
        </ul>
        <h2>Quick routine</h2>
        <ol>
          <li>Stand facing a window for soft light.</li>
          <li>Hold the phone at eye level, or have a friend take them.</li>
          <li>Take 5 photos, turn slightly, and take 5 more.</li>
          <li>Change your top, move to another room, and repeat.</li>
        </ol>
        <Cta />
      </>
    ),
  },
  {
    slug: "real-estate-instagram-post-ideas",
    title: "30 Real Estate Instagram Post Ideas (With Templates)",
    description: "A month of posts for real estate agents: listings, local spotlights, market education and personal-brand content.",
    date: "2026-09-10",
    readMinutes: 5,
    body: () => (
      <>
        <p>Consistency beats creativity on social media. Here are 30 post ideas you can rotate. Most work with the Just Listed, Open House, Sold and Coming Soon templates in your Brand Kit.</p>
        <h2>Listings & results (1-8)</h2>
        <ol>
          <li>Just Listed with price and highlights</li>
          <li>Coming Soon teaser</li>
          <li>Open House announcement</li>
          <li>Open House recap: how many visitors, what they loved</li>
          <li>Under Contract</li>
          <li>Just Sold</li>
          <li>A client testimonial (with permission)</li>
          <li>Behind the scenes of a listing photo shoot</li>
        </ol>
        <h2>Local expertise (9-16)</h2>
        <ol start={9}>
          <li>Favorite coffee shop in your farm area</li>
          <li>New restaurant opening</li>
          <li>School calendar and back-to-school tips</li>
          <li>Upcoming community events</li>
          <li>Neighborhood spotlight</li>
          <li>Best parks and trails</li>
          <li>New construction update</li>
          <li>Commute tips</li>
        </ol>
        <h2>Education (17-24)</h2>
        <ol start={17}>
          <li>What earnest money is</li>
          <li>Inspection vs. appraisal</li>
          <li>First-time buyer programs in your state</li>
          <li>Five things that lower a home&apos;s value</li>
          <li>Staging on a budget</li>
          <li>How to read a market report</li>
          <li>Closing-cost basics</li>
          <li>Myth vs. fact Monday</li>
        </ol>
        <h2>Personal brand (25-30)</h2>
        <ol start={25}>
          <li>Why you became an agent</li>
          <li>A day in your life</li>
          <li>Your team or brokerage</li>
          <li>Continuing-education wins</li>
          <li>Giving back locally</li>
          <li>A fresh headshot and a hello</li>
        </ol>
        <Cta />
      </>
    ),
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
