// Landing pages for each headshot style: /styles/[id]. Each targets the way
// agents search for that look ("white background realtor headshot", "outdoor
// real estate headshot"...). General advice only; no invented statistics.

export interface StyleGuide {
  id: string; // matches STYLES[].id
  title: string; // <title> and share image, before the site name
  h1: string;
  intro: string;
  bestFor: string[];
  wear: string[];
  useFor: string;
  tip: string;
}

export const STYLE_GUIDES: StyleGuide[] = [
  {
    id: "studio-gray",
    title: "Gray Background Realtor Headshots",
    h1: "Classic gray background headshots for real estate agents",
    intro:
      "A seamless gray studio backdrop is the safest choice in real estate. It keeps all the attention on your face, looks professional at any size, and works on MLS profiles, brokerage rosters and print.",
    bestFor: ["Your main MLS and brokerage roster photo", "Agents who want one photo that works everywhere", "Business cards and yard signs, where a busy background gets lost"],
    wear: ["Navy, charcoal or burgundy jackets stand out against gray", "Solid colors rather than fine stripes or small checks", "A light shirt or top for contrast near the face"],
    useFor: "MLS, Zillow and Realtor.com profiles, your brokerage website, business cards, sign riders and email signatures.",
    tip: "If you only keep one headshot, make it this one. Pair it with a lifestyle style for social media.",
  },
  {
    id: "bright-white",
    title: "White Background Realtor Headshots",
    h1: "White background headshots for real estate agents",
    intro:
      "Many brokerages ask for a plain white background so every agent on the roster matches. A bright, high-key white headshot looks clean on websites and cuts out easily for flyers and sign designs.",
    bestFor: ["Brokerages that require a white roster photo", "Flyers and signs where your photo is cut out", "A crisp, modern look on light websites"],
    wear: ["Mid to dark colors so you don't fade into the background", "Avoid all-white outfits, which blend into the backdrop", "Simple jewelry and accessories"],
    useFor: "Brokerage rosters, agent directories, flyers, sign designs and anywhere your photo sits on a white page.",
    tip: "Check your brokerage's photo guidelines. If they specify white, this is the style to submit.",
  },
  {
    id: "brand-backdrop",
    title: "Brand Color Headshots for Realtors",
    h1: "Headshots on your brand color",
    intro:
      "A solid backdrop in your own brand color makes your photo instantly recognizable next to your logo, listing graphics and social posts. You choose the color when you order, and teams can share one color so every agent matches.",
    bestFor: ["Agents building a personal brand", "Teams and brokerages that want a matching look", "Social media profiles and ads"],
    wear: ["A color that contrasts with your brand color, not one that matches it", "Neutral jackets (navy, charcoal, black) work with most brand colors", "Solid tops without logos"],
    useFor: "Instagram and Facebook profiles, team pages, Just Listed and Open House graphics, and paid ads.",
    tip: "Use the same color in your headshot, your graphics and your sign riders. Repetition is what makes a brand stick.",
  },
  {
    id: "modern-office",
    title: "Office Background Realtor Headshots",
    h1: "Modern office headshots for real estate agents",
    intro:
      "A bright, modern office behind you says established, organized and ready to work. It's a good fit for agents who want to look corporate without the plain-backdrop look.",
    bestFor: ["Agents who work with relocation and corporate clients", "Commercial and investment specialists", "LinkedIn and professional profiles"],
    wear: ["A suit or tailored blazer", "Crisp shirt or blouse", "Minimal accessories"],
    useFor: "LinkedIn, your website's about page, relocation packets and listing presentations.",
    tip: "Pair it with a plain-background version for places that require one.",
  },
  {
    id: "front-porch",
    title: "Front Porch Realtor Headshots",
    h1: "Front porch headshots for real estate agents",
    intro:
      "A welcoming craftsman porch at golden hour reads as home, warmth and community. It's a natural fit for residential agents who want to look approachable rather than corporate.",
    bestFor: ["Residential and first-time buyer agents", "Small towns and suburban markets", "Agents whose brand is friendly and local"],
    wear: ["Business casual: a soft blazer or a nice sweater", "Warm, earthy colors that suit golden-hour light", "Relaxed but neat, as you'd dress for a showing"],
    useFor: "Social media profiles, your Google Business Profile, newsletters and Open House posts.",
    tip: "Great for social posts. Keep a studio version for MLS if your brokerage prefers plain backgrounds.",
  },
  {
    id: "luxury-interior",
    title: "Luxury Realtor Headshots",
    h1: "Luxury interior headshots for high-end agents",
    intro:
      "An elegant, high-end home interior behind you signals that you work at the top of the market. It's designed for agents who list luxury homes and want their personal brand to match their listings.",
    bestFor: ["Luxury and high-end listing agents", "Agents building a premium personal brand", "Listing presentations for upscale sellers"],
    wear: ["A well-fitted suit or a structured dress", "Deep colors: black, navy, emerald, burgundy", "Refined accessories, nothing flashy"],
    useFor: "Listing presentations, luxury property marketing, your website and print pieces for high-end listings.",
    tip: "Keep the look consistent with your listing photography so your marketing feels like one brand.",
  },
  {
    id: "downtown",
    title: "Urban Downtown Realtor Headshots",
    h1: "Downtown headshots for urban real estate agents",
    intro:
      "A city streetscape behind you tells clients you know the urban market: condos, lofts and walkable neighborhoods. It feels energetic and current.",
    bestFor: ["Condo, loft and city-center agents", "Agents who work with young professionals", "Social media and personal branding"],
    wear: ["Modern business casual: a blazer with a simple tee or blouse", "Clean lines and solid colors", "Outerwear works well in this setting"],
    useFor: "Instagram, TikTok and Facebook profiles, condo marketing and neighborhood guides.",
    tip: "Pair with the Classic Studio style for MLS and roster photos.",
  },
  {
    id: "neighborhood",
    title: "Neighborhood Realtor Headshots",
    h1: "Neighborhood headshots for suburban agents",
    intro:
      "A tree-lined suburban street says local expert. This style fits agents who sell family homes and want to look like the neighbor you'd trust with your biggest purchase.",
    bestFor: ["Suburban and family-home agents", "Neighborhood specialists and farm-area marketing", "Postcards and community newsletters"],
    wear: ["Business casual in soft, friendly colors", "A light jacket or cardigan", "Nothing too formal for the setting"],
    useFor: "Farming postcards, community newsletters, Facebook and your Google Business Profile.",
    tip: "Consistent neighborhood postcards with the same friendly photo build recognition over time.",
  },
  {
    id: "open-house",
    title: "Open House Realtor Headshots",
    h1: "Open house headshots for real estate agents",
    intro:
      "The bright entryway of a staged home is where clients actually meet you. This style looks like you're welcoming them in, which makes it a natural fit for open house marketing.",
    bestFor: ["Open house signs and posts", "Agents who host a lot of open houses", "Sign-in sheets and follow-up emails"],
    wear: ["What you'd wear to host: a blazer or smart business casual", "Light, fresh colors", "A simple top without logos or busy patterns"],
    useFor: "Open House graphics, event posts, sign-in materials and follow-up emails to visitors.",
    tip: "Pair it with the Brand Kit's Open House template so the photo and the graphic match.",
  },
  {
    id: "outdoor-greenery",
    title: "Outdoor Realtor Headshots",
    h1: "Outdoor headshots for real estate agents",
    intro:
      "Soft green bokeh behind you is warm, natural and approachable. Outdoor headshots are among the most popular choices for agents who want a friendly, less formal look.",
    bestFor: ["Agents with a warm, approachable brand", "Rural, land and lifestyle markets", "Social media and personal websites"],
    wear: ["Blues, whites and warm neutrals, which contrast well with green", "Avoid green tops that blend into the background", "Business casual layers"],
    useFor: "Social profiles, your website, Google Business Profile and personal-brand posts.",
    tip: "Outdoor photos feel personal. Keep a plain-background version for official rosters.",
  },
  {
    id: "coastal",
    title: "Coastal & Beach Realtor Headshots",
    h1: "Coastal headshots for beach-market agents",
    intro:
      "A beach-house deck with soft coastal light is made for agents in waterfront and vacation markets. It tells second-home buyers and relocators you live the lifestyle you sell.",
    bestFor: ["Beach, lake and waterfront agents", "Vacation and second-home markets", "Relocation buyers researching agents online"],
    wear: ["Light, breezy business casual", "Whites, blues and sandy neutrals", "A light blazer if you want a touch more polish"],
    useFor: "Social media, vacation-rental and second-home marketing, your website and listing presentations.",
    tip: "Pair with a Bright White version for brokerage rosters.",
  },
  {
    id: "black-white",
    title: "Black & White Realtor Headshots",
    h1: "Black and white headshots for real estate agents",
    intro:
      "A monochrome portrait is timeless and editorial. It stands out in a feed full of color and works well for agents with a classic or high-end brand.",
    bestFor: ["Agents with a classic, editorial brand", "Luxury print pieces and magazines", "Standing out on social media"],
    wear: ["Strong contrast: a dark jacket with a light shirt", "Solid colors, since patterns can look busy in black and white", "Simple, classic accessories"],
    useFor: "Print ads, magazine features, your website's about page and social profiles.",
    tip: "Use color for MLS and portals, where most agents' photos are in color, and black and white for print and branding.",
  },
];

export function getStyleGuide(id: string) {
  return STYLE_GUIDES.find((g) => g.id === id);
}
