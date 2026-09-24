export interface PhotoView {
  id: string;
  url: string;
  style: string;
  favorite: boolean;
}

export interface StatusView {
  status: string;
  progress: { total: number; done: number };
  redosRemaining: number;
  photos: PhotoView[];
}

export interface StyleView {
  id: string;
  name: string;
  description: string;
}

export interface TemplateView {
  id: string;
  name: string;
  needs: string[];
  width: number;
  height: number;
}

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
  return data as T;
}

export const postJson = (url: string, body: unknown) =>
  api(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
