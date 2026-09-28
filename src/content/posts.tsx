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
  /** Shorter <title> when the headline is long (keeps it under ~60 characters in search results). */
  seoTitle?: string;
  /** Last meaningful update (ISO date); defaults to date. */
  updated?: string;
  /** Slugs of guides to suggest at the end; otherwise the newest others. */
  related?: string[];
  body: () => ReactNode;
}


export const POSTS: Post[] = [
  {
    slug: "realtor-headshot-tips",
    title: "Realtor Headshot Tips: 12 Rules for a Photo That Gets Calls",
    seoTitle: "Realtor Headshot Tips: 12 Rules That Get Calls",
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
      </>
    ),
  },
  {
    slug: "ai-headshots-vs-photographer",
    title: "AI Headshots vs. a Photographer: An Honest Comparison for Real Estate Agents",
    seoTitle: "AI Headshots vs. a Photographer for Realtors",
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
      </>
    ),
  },
  {
    slug: "nc-real-estate-advertising-rules",
    title: "North Carolina Real Estate Advertising Basics for Your Headshot & Social Posts",
    seoTitle: "NC Real Estate Advertising Rules for Agents",
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
      </>
    ),
  },
  {
    slug: "how-to-take-selfies-for-ai-headshots",
    title: "How to Take Selfies for AI Headshots (The 10-Minute Guide)",
    seoTitle: "How to Take Selfies for AI Headshots",
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
      </>
    ),
  },
  {
    slug: "real-estate-instagram-post-ideas",
    title: "30 Real Estate Instagram Post Ideas (With Templates)",
    seoTitle: "30 Real Estate Instagram Post Ideas",
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
      </>
    ),
  },
  {
    slug: "what-to-wear-for-realtor-headshots",
    title: "What to Wear for a Realtor Headshot (Women and Men)",
    seoTitle: "What to Wear for a Realtor Headshot",
    description: "Colors, necklines, jackets and accessories that photograph well for real estate headshots, plus what to avoid and how to match your outfit to your background.",
    date: "2026-09-28",
    readMinutes: 5,
    related: ["best-background-for-real-estate-headshots", "realtor-headshot-tips", "how-to-take-selfies-for-ai-headshots"],
    body: () => (
      <>
        <p>Your outfit is the second thing people notice in a headshot, right after your face. The goal is simple: look like the professional a client will meet at a listing appointment, and make sure nothing in the photo competes with your eyes and smile.</p>
        <h2>Start with solid colors</h2>
        <p>Solid colors photograph cleanly at every size, from a billboard to a tiny circle on Zillow. Navy, charcoal, burgundy, deep green and soft jewel tones are reliable choices for almost every skin tone. Fine stripes, small checks and busy prints can shimmer on screens and pull attention away from your face.</p>
        <h2>Match your outfit to your background</h2>
        <p>Contrast is what makes you stand out. On a <Link href="/styles/studio-gray">gray</Link> or <Link href="/styles/bright-white">white background</Link>, mid to dark colors work best, and an all-white outfit will fade into a white backdrop. On a <Link href="/styles/outdoor-greenery">green outdoor background</Link>, avoid green tops. On a <Link href="/styles/brand-backdrop">brand color backdrop</Link>, pick a neutral jacket that contrasts with your brand color rather than matching it.</p>
        <h2>For women</h2>
        <ul>
          <li>A structured blazer over a simple top is the classic real estate look and suits almost every style.</li>
          <li>V-necks and scoop necks frame the face and elongate the neck in a head-and-shoulders crop.</li>
          <li>Keep jewelry simple: small earrings and a single delicate necklace read well; large statement pieces can dominate a small photo.</li>
          <li>Sleeveless tops can look casual in a tight crop, so add a jacket or cardigan if you want a professional look.</li>
        </ul>
        <h2>For men</h2>
        <ul>
          <li>A well-fitted jacket in navy or charcoal is the safest choice. The fit at the shoulders matters most, because that&apos;s what shows in the frame.</li>
          <li>A tie is optional. Business casual (jacket, open collar) is common for residential agents; a tie fits luxury, commercial and corporate relocation work.</li>
          <li>Choose a shirt that contrasts with your jacket: white or light blue under navy or charcoal is hard to beat.</li>
        </ul>
        <h2>Dress for your market</h2>
        <p>Your headshot should look like the agent clients will meet. A downtown luxury specialist and a rural land agent shouldn&apos;t dress identically. <Link href="/styles/luxury-interior">Luxury</Link> agents can lean formal; <Link href="/styles/front-porch">front porch</Link> and <Link href="/styles/coastal">coastal</Link> styles suit relaxed business casual.</p>
        <h2>What to avoid</h2>
        <ul>
          <li>Logos, slogans and brand names on clothing</li>
          <li>Neon colors, which can cast color onto your skin</li>
          <li>Clothes you wouldn&apos;t wear to meet a seller</li>
          <li>Anything that needs explaining</li>
        </ul>
        <h2>Tips for AI headshots</h2>
        <p>With AI headshots you don&apos;t need to own the perfect outfit. The selfies you upload teach the AI your face; the outfit in each style is generated for you, and you can choose formal, business casual or a mix when you order. What matters in your selfies is that your face is clear and well lit. See <Link href="/blog/how-to-take-selfies-for-ai-headshots">how to take selfies for AI headshots</Link>.</p>
      </>
    ),
  },
  {
    slug: "best-background-for-real-estate-headshots",
    title: "The Best Background for a Real Estate Headshot",
    seoTitle: "Best Background for a Real Estate Headshot",
    description: "Gray, white, brand color or lifestyle? How to pick a headshot background for MLS, your brokerage, social media and print, and why most agents should have two.",
    date: "2026-09-28",
    readMinutes: 5,
    related: ["real-estate-headshot-ideas", "what-to-wear-for-realtor-headshots", "realtor-headshot-tips"],
    body: () => (
      <>
        <p>The background of your headshot decides where you can use it. A plain backdrop works everywhere; a lifestyle background tells a story about your market. Most agents get the best results from having both.</p>
        <h2>Plain backgrounds: the one you need</h2>
        <p>Brokerage rosters, MLS profiles and agent directories often expect a plain, neutral background so every agent looks consistent. Check your brokerage&apos;s photo guidelines, but these three are the safe choices:</p>
        <ul>
          <li><Link href="/styles/studio-gray">Classic gray</Link>: the most versatile. It looks professional at any size and works in print.</li>
          <li><Link href="/styles/bright-white">Bright white</Link>: often requested by brokerages, and easy to cut out for flyers and signs.</li>
          <li><Link href="/styles/brand-backdrop">Brand color</Link>: a solid backdrop in your color makes your photo match your logo and graphics. Great for teams that want one look.</li>
        </ul>
        <h2>Lifestyle backgrounds: the one that sells your market</h2>
        <p>On social media, your website and your Google Business Profile, a background that hints at where you work helps clients picture working with you.</p>
        <ul>
          <li><Link href="/styles/front-porch">Front porch</Link> and <Link href="/styles/neighborhood">neighborhood</Link> for residential and suburban agents</li>
          <li><Link href="/styles/downtown">Downtown</Link> for condo and city-center agents</li>
          <li><Link href="/styles/coastal">Coastal</Link> for beach and waterfront markets</li>
          <li><Link href="/styles/luxury-interior">Luxury interior</Link> for high-end listing agents</li>
          <li><Link href="/styles/outdoor-greenery">Outdoor greenery</Link> for a warm, approachable look anywhere</li>
          <li><Link href="/styles/modern-office">Modern office</Link> for corporate relocation and commercial work</li>
        </ul>
        <h2>How to choose</h2>
        <p>Ask where the photo will appear most. If it&apos;s your MLS profile and yard signs, go plain. If it&apos;s Instagram and Facebook, a lifestyle background gets more attention. If you can only have one, choose gray: it works everywhere.</p>
        <h2>Background rules that apply to every style</h2>
        <ul>
          <li>The background should be softer and less detailed than your face. Blur is your friend.</li>
          <li>Nothing should appear to grow out of your head: poles, trees and door frames.</li>
          <li>Keep your outfit in contrast with the background (see <Link href="/blog/what-to-wear-for-realtor-headshots">what to wear</Link>).</li>
          <li>Use the same primary photo everywhere so people recognize you.</li>
        </ul>
        <p>Every AgentFrame order includes several styles, so you can get a plain version and a lifestyle version from the same set of selfies. <Link href="/styles">Compare all 12 styles</Link>.</p>
      </>
    ),
  },
  {
    slug: "how-often-to-update-realtor-headshot",
    title: "How Often Should Realtors Update Their Headshot?",
    description: "When a real estate headshot is out of date, the signs it's time for a new one, and how to refresh your photo everywhere it appears without missing a spot.",
    date: "2026-09-28",
    readMinutes: 4,
    related: ["realtor-headshot-tips", "ai-headshots-vs-photographer", "realtor-email-signature"],
    body: () => (
      <>
        <p>A good rule of thumb: update your headshot every one to two years, and sooner whenever you look noticeably different. Clients meet you in person, and the moment they recognize you from your photo is the start of trust.</p>
        <h2>Signs it&apos;s time for a new headshot</h2>
        <ul>
          <li>A new hairstyle, hair color, glasses or facial hair</li>
          <li>A noticeable change in weight or appearance</li>
          <li>A new brokerage or brand colors</li>
          <li>Your photo looks dated: old fashion, low resolution or a style you no longer use</li>
          <li>You use different photos on different sites and want one consistent look</li>
          <li>A client has ever said &ldquo;you look different from your picture&rdquo;</li>
        </ul>
        <h2>Why agents put it off</h2>
        <p>Booking a photographer, choosing an outfit and taking half a day off are the usual reasons headshots get stale. AI headshots remove most of that: you upload selfies and get new photos the same day. See <Link href="/blog/ai-headshots-vs-photographer">AI headshots vs. a photographer</Link> for an honest comparison.</p>
        <h2>Where to update it (checklist)</h2>
        <ul>
          <li>MLS profile and your brokerage roster</li>
          <li>Zillow, Realtor.com and other portals</li>
          <li>Google Business Profile</li>
          <li>Website and blog author bio</li>
          <li>LinkedIn, Instagram, Facebook and TikTok</li>
          <li><Link href="/blog/realtor-email-signature">Email signature</Link></li>
          <li>Business cards, sign riders and printed flyers</li>
          <li>Listing presentation and buyer consultation decks</li>
          <li>Saved templates for Just Listed, Open House and Sold posts</li>
        </ul>
        <h2>Refresh seasonally for social media</h2>
        <p>Your main headshot can stay the same for a year or two, but social media rewards variety. Many agents keep one primary headshot for MLS and signs, and rotate a few lifestyle versions for posts. Our <Link href="/#pricing">Always Fresh plan</Link> gives you a new shoot every six months for exactly this reason.</p>
      </>
    ),
  },
  {
    slug: "real-estate-headshot-ideas",
    title: "Real Estate Headshot Ideas: 12 Looks for Every Market",
    seoTitle: "Real Estate Headshot Ideas: 12 Looks",
    description: "Twelve real estate headshot ideas, from classic studio to coastal and luxury, with who each look suits and where to use it.",
    date: "2026-09-28",
    readMinutes: 6,
    related: ["best-background-for-real-estate-headshots", "what-to-wear-for-realtor-headshots", "real-estate-instagram-post-ideas"],
    body: () => (
      <>
        <p>The best real estate headshot is the one that matches your market and your personality. Here are twelve looks agents use, who they suit, and where each works best.</p>
        <h2>1. Classic studio gray</h2>
        <p>The safe, professional choice for MLS, rosters and print. <Link href="/styles/studio-gray">See the Classic Studio style</Link>.</p>
        <h2>2. Bright white</h2>
        <p>Clean and modern, and often what brokerages ask for. <Link href="/styles/bright-white">Bright White</Link>.</p>
        <h2>3. Your brand color</h2>
        <p>A solid backdrop that matches your logo and graphics. Perfect for teams. <Link href="/styles/brand-backdrop">Brand Color</Link>.</p>
        <h2>4. Modern office</h2>
        <p>Established and organized, for relocation and commercial specialists. <Link href="/styles/modern-office">Modern Brokerage</Link>.</p>
        <h2>5. Front porch at golden hour</h2>
        <p>Warm and welcoming for residential agents. <Link href="/styles/front-porch">Front Porch</Link>.</p>
        <h2>6. Luxury interior</h2>
        <p>An elegant home behind you for high-end listing agents. <Link href="/styles/luxury-interior">Luxury Listing</Link>.</p>
        <h2>7. Downtown streetscape</h2>
        <p>Energetic and current for condo and city agents. <Link href="/styles/downtown">Downtown</Link>.</p>
        <h2>8. Tree-lined neighborhood</h2>
        <p>The trusted local expert look for suburban markets. <Link href="/styles/neighborhood">Neighborhood</Link>.</p>
        <h2>9. Open house entryway</h2>
        <p>Looks like you&apos;re welcoming clients in. Great for event posts. <Link href="/styles/open-house">Open House</Link>.</p>
        <h2>10. Outdoor greenery</h2>
        <p>Soft green background, friendly and approachable. <Link href="/styles/outdoor-greenery">Park Greenery</Link>.</p>
        <h2>11. Coastal deck</h2>
        <p>For beach, lake and vacation markets. <Link href="/styles/coastal">Coastal</Link>.</p>
        <h2>12. Black and white</h2>
        <p>Timeless and editorial; stands out in a colorful feed. <Link href="/styles/black-white">Black &amp; White</Link>.</p>
        <h2>Mix two or three looks</h2>
        <p>Most agents get the most use from one plain-background photo for official profiles and one or two lifestyle looks for social media and marketing. Choosing a background? Read <Link href="/blog/best-background-for-real-estate-headshots">the best background for a real estate headshot</Link>.</p>
      </>
    ),
  },
  {
    slug: "realtor-email-signature",
    title: "Realtor Email Signature: What to Include (With Examples)",
    seoTitle: "Realtor Email Signature: What to Include",
    description: "What a real estate agent's email signature should include, what to leave out, and simple layouts that work on phones and look professional.",
    date: "2026-09-28",
    readMinutes: 4,
    related: ["nc-real-estate-advertising-rules", "how-often-to-update-realtor-headshot", "realtor-headshot-tips"],
    body: () => (
      <>
        <p>You send more emails than almost any other marketing you do. A clear email signature turns every message into a small business card: who you are, how to reach you and which brokerage you work with.</p>
        <h2>What to include</h2>
        <ul>
          <li><strong>Your headshot.</strong> A small, current photo makes emails personal and helps clients recognize you at the first showing.</li>
          <li><strong>Your name and title</strong>, as you&apos;re licensed and as your brokerage lists you.</li>
          <li><strong>Your brokerage name.</strong> Many state commissions require the firm name in advertising; including it in your signature is a simple habit. See our <Link href="/blog/nc-real-estate-advertising-rules">NC advertising basics</Link> for an example of state rules.</li>
          <li><strong>Phone number</strong>, with a tap-to-call link.</li>
          <li><strong>Email and website.</strong></li>
          <li><strong>License number</strong> if your state or brokerage requires it.</li>
        </ul>
        <h2>What to leave out</h2>
        <ul>
          <li>Long quotes and slogans</li>
          <li>More than two or three social icons</li>
          <li>Several different fonts and colors</li>
          <li>Large images that load slowly or get blocked</li>
        </ul>
        <h2>A simple layout that works</h2>
        <p>Photo on the left, text on the right: name and title on the first line, brokerage on the second, phone and website on the third. Keep it narrow enough to read on a phone, and use your brand color for one accent, such as your name.</p>
        <h2>Example</h2>
        <p><strong>Jordan Ellis</strong>, REALTOR®<br />Triangle Home Group | Example Realty<br />(919) 555-0142 · jordanellis.example.com</p>
        <p>(Use the REALTOR® mark only if you&apos;re a member of the National Association of REALTORS®.)</p>
        <h2>Keep it consistent</h2>
        <p>Use the same headshot and colors in your signature, your social profiles and your listing graphics. The AgentFrame Brand Kit includes an email signature graphic made from your new headshot, in the same style as your Just Listed and Open House posts. And remember to <Link href="/blog/how-often-to-update-realtor-headshot">update your photo</Link> every year or two.</p>
      </>
    ),
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function relatedPosts(slug: string, count = 3): Post[] {
  const post = getPost(slug);
  const picked = (post?.related ?? []).map(getPost).filter((p): p is Post => !!p);
  const rest = [...POSTS].reverse().filter((p) => p.slug !== slug && !picked.includes(p));
  return [...picked, ...rest].slice(0, count);
}
