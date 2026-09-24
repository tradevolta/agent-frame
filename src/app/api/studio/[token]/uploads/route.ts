import { addUpload, removeUpload, UserError } from "@/lib/pipeline";
import { orderFromParams } from "@/lib/studio-auth";
import { handle, json } from "@/lib/http";

const MAX_BYTES = 4 * 1024 * 1024; // client resizes to ~1024px JPEG first
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Ctx = { params: Promise<{ token: string }> };

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const order = await orderFromParams(params);
  if (order.status !== "awaiting_upload") throw new UserError("Uploads are closed for this shoot.");
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) throw new UserError("No file received.");
  if (!TYPES.includes(file.type)) throw new UserError("Please upload JPG, PNG or WebP photos.");
  if (file.size > MAX_BYTES) throw new UserError("That photo is too large.");
  return json(await addUpload(order, file));
});

export const DELETE = handle(async (req: Request, { params }: Ctx) => {
  const order = await orderFromParams(params);
  if (order.status !== "awaiting_upload") throw new UserError("Uploads are closed for this shoot.");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new UserError("Missing id.");
  await removeUpload(order, id);
  return json({ ok: true });
});
