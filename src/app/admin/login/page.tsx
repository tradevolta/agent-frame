import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="card p-6">
        <h1 className="font-display text-2xl">Admin</h1>
        <p className="mt-1 text-sm text-muted">Enter the admin password (ADMIN_PASSWORD in Vercel).</p>
        <LoginForm next={target} />
      </div>
    </div>
  );
}
