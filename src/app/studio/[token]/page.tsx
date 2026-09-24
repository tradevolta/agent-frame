import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByToken, listUploads, orderJobsSummary, orderPhotos, MIN_UPLOADS, MAX_UPLOADS } from "@/lib/pipeline";
import { PLANS, isPlanId } from "@/lib/plans";
import { STYLES, BACKDROP_COLORS } from "@/lib/styles";
import { TEMPLATES } from "@/lib/brandkit";
import { isToken } from "@/lib/tokens";
import { appUrl } from "@/lib/brand";
import { Studio } from "./studio";

export const metadata: Metadata = { title: "Your studio", robots: { index: false, follow: false } };

export default async function StudioPage({ params }: PageProps<"/studio/[token]">) {
  const { token } = await params;
  if (!isToken(token)) notFound();
  const order = await getOrderByToken(token);
  if (!order) notFound();
  const plan = isPlanId(order.plan) ? PLANS[order.plan] : PLANS.starter;
  const [uploads, photos, progress] = await Promise.all([listUploads(order.id), orderPhotos(order.id), orderJobsSummary(order.id)]);

  return (
    <Studio
      token={token}
      initial={{
        status: order.status,
        progress,
        redosRemaining: order.redosRemaining,
        photos: photos.map((p) => ({ id: p.id, url: p.url, style: p.style, favorite: p.favorite })),
      }}
      uploads={uploads.map((u) => ({ id: u.id, url: u.url }))}
      plan={{ name: plan.name, styleCount: plan.styleCount, brandKit: plan.brandKit, photosPerStyle: plan.photosPerStyle }}
      isTeam={!!order.teamId}
      styles={STYLES.map((s) => ({ id: s.id, name: s.name, description: s.description }))}
      chosenStyles={order.styles}
      colors={Object.entries(BACKDROP_COLORS).map(([id, c]) => ({ id, label: c.label, hex: c.hex }))}
      templates={TEMPLATES.map((t) => ({ id: t.id, name: t.name, needs: t.needs, width: t.width, height: t.height }))}
      profile={order.profile}
      referralUrl={order.referralCode ? appUrl(`/?ref=${order.referralCode}`) : null}
      minUploads={MIN_UPLOADS}
      maxUploads={MAX_UPLOADS}
    />
  );
}
