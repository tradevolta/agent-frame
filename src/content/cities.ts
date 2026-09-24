// Programmatic SEO pages: /realtor-headshots/[slug]. Each city gets tailored
// copy and style recommendations (no invented statistics).
export interface City {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  blurb: string;
  styles: string[]; // style ids to feature
  nearby?: string[];
}

export const CITIES: City[] = [
  { slug: "raleigh-nc", name: "Raleigh", state: "North Carolina", stateCode: "NC", blurb: "From North Hills condos to Wake County new construction, Raleigh buyers compare agents online before they ever call. A current, polished headshot is the first impression.", styles: ["modern-office", "downtown", "neighborhood", "studio-gray"], nearby: ["durham-nc", "cary-nc", "wake-forest-nc"] },
  { slug: "durham-nc", name: "Durham", state: "North Carolina", stateCode: "NC", blurb: "Durham's mix of historic bungalows, downtown lofts and RTP commuters rewards agents who look approachable and current.", styles: ["downtown", "front-porch", "outdoor-greenery", "bright-white"], nearby: ["raleigh-nc", "chapel-hill-nc"] },
  { slug: "chapel-hill-nc", name: "Chapel Hill", state: "North Carolina", stateCode: "NC", blurb: "Relocating faculty, medical professionals and families pick agents who look credible and warm. Keep your photo current every season.", styles: ["outdoor-greenery", "front-porch", "studio-gray", "black-white"], nearby: ["durham-nc", "raleigh-nc"] },
  { slug: "cary-nc", name: "Cary", state: "North Carolina", stateCode: "NC", blurb: "Cary's family-focused neighborhoods favor friendly, polished agent branding across Zillow, Google and yard signs.", styles: ["neighborhood", "front-porch", "bright-white", "open-house"], nearby: ["apex-nc", "raleigh-nc", "holly-springs-nc"] },
  { slug: "wake-forest-nc", name: "Wake Forest", state: "North Carolina", stateCode: "NC", blurb: "Wake Forest's growth brings a steady stream of new-construction buyers. Your headshot shows up on every builder flyer and open house sign.", styles: ["front-porch", "neighborhood", "open-house", "studio-gray"], nearby: ["youngsville-nc", "rolesville-nc", "raleigh-nc"] },
  { slug: "youngsville-nc", name: "Youngsville", state: "North Carolina", stateCode: "NC", blurb: "Small-town feel, fast growth. Youngsville agents win on trust, so your photo needs to look like the person clients will actually meet.", styles: ["front-porch", "neighborhood", "outdoor-greenery", "bright-white"], nearby: ["wake-forest-nc", "rolesville-nc"] },
  { slug: "rolesville-nc", name: "Rolesville", state: "North Carolina", stateCode: "NC", blurb: "New subdivisions and first-time buyers make Rolesville a social-media-first market. Match your headshot to your Just Listed posts.", styles: ["neighborhood", "open-house", "front-porch", "brand-backdrop"], nearby: ["wake-forest-nc", "knightdale-nc"] },
  { slug: "knightdale-nc", name: "Knightdale", state: "North Carolina", stateCode: "NC", blurb: "East Wake's value-driven buyers respond to agents who look approachable and professional in equal measure.", styles: ["neighborhood", "studio-gray", "open-house", "outdoor-greenery"], nearby: ["rolesville-nc", "raleigh-nc"] },
  { slug: "apex-nc", name: "Apex", state: "North Carolina", stateCode: "NC", blurb: "The Peak of Good Living sells on lifestyle. Pair a friendly headshot with neighborhood-style branding.", styles: ["neighborhood", "front-porch", "outdoor-greenery", "bright-white"], nearby: ["cary-nc", "holly-springs-nc"] },
  { slug: "holly-springs-nc", name: "Holly Springs", state: "North Carolina", stateCode: "NC", blurb: "Holly Springs' newer communities mean lots of open houses. Look consistent on every sign-in sheet and social post.", styles: ["open-house", "neighborhood", "studio-gray", "front-porch"], nearby: ["apex-nc", "fuquay-varina-nc"] },
  { slug: "fuquay-varina-nc", name: "Fuquay-Varina", state: "North Carolina", stateCode: "NC", blurb: "Fuquay's mix of historic downtown and new builds rewards agents with a warm, local look.", styles: ["front-porch", "downtown", "neighborhood", "bright-white"], nearby: ["holly-springs-nc", "garner-nc"] },
  { slug: "garner-nc", name: "Garner", state: "North Carolina", stateCode: "NC", blurb: "Garner buyers want a trustworthy local expert. A crisp headshot on your Google Business Profile helps you get found.", styles: ["studio-gray", "neighborhood", "modern-office", "outdoor-greenery"], nearby: ["raleigh-nc", "fuquay-varina-nc"] },
  { slug: "charlotte-nc", name: "Charlotte", state: "North Carolina", stateCode: "NC", blurb: "Charlotte is competitive and polished, from Uptown high-rises to South End townhomes. Look the part everywhere you appear.", styles: ["downtown", "luxury-interior", "modern-office", "black-white"], nearby: ["concord-nc"] },
  { slug: "concord-nc", name: "Concord", state: "North Carolina", stateCode: "NC", blurb: "Concord's growth outside Charlotte brings relocation buyers who research agents online first.", styles: ["neighborhood", "studio-gray", "front-porch", "modern-office"], nearby: ["charlotte-nc"] },
  { slug: "greensboro-nc", name: "Greensboro", state: "North Carolina", stateCode: "NC", blurb: "In the Triad, reputation travels. Keep a consistent, professional photo across MLS, Zillow and your cards.", styles: ["studio-gray", "downtown", "front-porch", "bright-white"], nearby: ["winston-salem-nc", "high-point-nc"] },
  { slug: "winston-salem-nc", name: "Winston-Salem", state: "North Carolina", stateCode: "NC", blurb: "Historic homes and a revitalized downtown call for a classic, credible agent look.", styles: ["black-white", "front-porch", "downtown", "studio-gray"], nearby: ["greensboro-nc", "high-point-nc"] },
  { slug: "high-point-nc", name: "High Point", state: "North Carolina", stateCode: "NC", blurb: "High Point agents balance furniture-market polish with neighborhood warmth.", styles: ["luxury-interior", "studio-gray", "neighborhood", "modern-office"], nearby: ["greensboro-nc", "winston-salem-nc"] },
  { slug: "wilmington-nc", name: "Wilmington", state: "North Carolina", stateCode: "NC", blurb: "Coastal buyers and second-home shoppers expect a relaxed but professional agent. Our Coastal style was made for you.", styles: ["coastal", "front-porch", "bright-white", "outdoor-greenery"], nearby: ["raleigh-nc"] },
  { slug: "asheville-nc", name: "Asheville", state: "North Carolina", stateCode: "NC", blurb: "Mountain-town buyers and relocators pick agents who feel authentic. Go natural and outdoorsy.", styles: ["outdoor-greenery", "front-porch", "black-white", "neighborhood"], nearby: ["charlotte-nc"] },
  { slug: "fayetteville-nc", name: "Fayetteville", state: "North Carolina", stateCode: "NC", blurb: "Military relocation buyers often choose an agent before they arrive. Your online photo does the handshake.", styles: ["studio-gray", "bright-white", "neighborhood", "modern-office"], nearby: ["raleigh-nc"] },
  { slug: "charleston-sc", name: "Charleston", state: "South Carolina", stateCode: "SC", blurb: "Historic charm and coastal luxury: Charleston agents need a look that fits both.", styles: ["coastal", "luxury-interior", "front-porch", "black-white"] },
  { slug: "richmond-va", name: "Richmond", state: "Virginia", stateCode: "VA", blurb: "From the Fan to the suburbs, Richmond buyers research agents online first.", styles: ["downtown", "front-porch", "studio-gray", "neighborhood"] },
  { slug: "atlanta-ga", name: "Atlanta", state: "Georgia", stateCode: "GA", blurb: "In a market this big, a sharp, consistent headshot helps you stand out on every portal.", styles: ["downtown", "luxury-interior", "modern-office", "brand-backdrop"] },
  { slug: "nashville-tn", name: "Nashville", state: "Tennessee", stateCode: "TN", blurb: "Relocation-heavy Nashville rewards agents with a memorable, approachable personal brand.", styles: ["downtown", "front-porch", "black-white", "brand-backdrop"] },
  { slug: "tampa-fl", name: "Tampa", state: "Florida", stateCode: "FL", blurb: "Sunny, coastal and competitive: pair a bright headshot with scroll-stopping listing graphics.", styles: ["coastal", "bright-white", "luxury-interior", "neighborhood"] },
  { slug: "dallas-tx", name: "Dallas", state: "Texas", stateCode: "TX", blurb: "Big market, big competition. Look polished on every listing and every sign.", styles: ["luxury-interior", "modern-office", "downtown", "studio-gray"] },
  { slug: "phoenix-az", name: "Phoenix", state: "Arizona", stateCode: "AZ", blurb: "Relocation buyers pick agents from their phones. Make your first impression count.", styles: ["bright-white", "modern-office", "neighborhood", "luxury-interior"] },
];

export function getCity(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}
