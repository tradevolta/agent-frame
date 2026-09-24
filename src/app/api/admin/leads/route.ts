import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, orders } from "@/lib/db/schema";

// CSV of leads + customers for your email tool. Protected by src/proxy.ts.
export async function GET() {
  const db = await getDb();
  const [leadRows, customerRows] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)),
    db.select({ email: orders.email, status: orders.status, plan: orders.plan, createdAt: orders.createdAt }).from(orders).orderBy(desc(orders.createdAt)),
  ]);
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    "email,type,source,created_at",
    ...leadRows.map((l) => [l.email, "lead", l.source, l.createdAt.toISOString()].map(esc).join(",")),
    ...customerRows.filter((c) => c.email && c.status !== "pending_payment").map((c) => [c.email!, "customer", c.plan, c.createdAt.toISOString()].map(esc).join(",")),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="contacts.csv"' } });
}
