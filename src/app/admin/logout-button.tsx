"use client";

export function LogoutButton() {
  return (
    <button
      className="btn-ghost !py-2"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load so the proxy sees the cleared cookie
        window.location.assign("/admin/login");
      }}
    >
      Log out
    </button>
  );
}
