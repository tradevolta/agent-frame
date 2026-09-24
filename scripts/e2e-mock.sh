#!/usr/bin/env bash
# End-to-end smoke test against a running server in mock mode (no API keys).
# Usage:
#   npm run build
#   ALLOW_MOCK_PAYMENTS=true APP_SIGNING_SECRET=test npx next start &
#   bash scripts/e2e-mock.sh
set -euo pipefail
B=${BASE_URL:-http://localhost:3000}
WORK=$(mktemp -d)
curl -sf "$B/opengraph-image" -o "$WORK/face.png"
j() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

echo "== individual order (pro)"
URL=$(curl -sf -X POST "$B/api/checkout" -H 'Content-Type: application/json' -d '{"kind":"order","plan":"pro","email":"agent@example.com"}' | j "d['url']")
LOC=$(curl -s -o /dev/null -w "%{redirect_url}" "$URL")
TOKEN=$(echo "$LOC" | sed -E 's#.*/studio/([^?]+).*#\1#')
curl -sf "$B/api/studio/$TOKEN/status" | j "d['status']"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/studio/$TOKEN/submit" -H 'Content-Type: application/json' -d '{"subject":"woman","attire":"style_default","styles":[],"consent":true}')
echo "submit with 0 uploads -> $code (expect 400)"
for i in $(seq 1 8); do curl -sf -F "file=@$WORK/face.png;type=image/png" "$B/api/studio/$TOKEN/uploads" > /dev/null; done
curl -sf -X POST "$B/api/studio/$TOKEN/submit" -H 'Content-Type: application/json' -d '{"subject":"woman","attire":"style_default","backdropColor":"teal","styles":[],"consent":true}' > /dev/null
curl -sf "$B/api/studio/$TOKEN/status" | j "d['status'], d['progress'], 'redos', d['redosRemaining'], 'photos', len(d['photos'])"
PHOTO=$(curl -sf "$B/api/studio/$TOKEN/status" | j "d['photos'][0]['id']")
curl -sf -X POST "$B/api/studio/$TOKEN/favorite" -H 'Content-Type: application/json' -d "{\"photoId\":\"$PHOTO\",\"favorite\":true}" > /dev/null
curl -sf -X POST "$B/api/studio/$TOKEN/redo" -H 'Content-Type: application/json' -d '{"style":"coastal"}' > /dev/null
curl -sf "$B/api/studio/$TOKEN/status" | j "'after redo: redos', d['redosRemaining'], 'photos', len(d['photos'])"
curl -sf -X POST "$B/api/studio/$TOKEN/profile" -H 'Content-Type: application/json' -d '{"fullName":"Jordan Ellis","brokerage":"Triangle Realty","phone":"(919) 555-0123","brandColor":"#6b1f2e"}' > /dev/null
for t in just-listed open-house sold business-card email-signature linkedin-banner; do
  curl -sf "$B/api/brand-kit/$TOKEN/$t?photo=$PHOTO&address=412+Oak+Hollow+Dr&price=%24489%2C000" -o "$WORK/$t.png"
  echo "brand kit $t: $(file -b "$WORK/$t.png" | cut -c1-40)"
done
curl -sf "$B/api/studio/$TOKEN/download" -o "$WORK/all.zip"; echo "zip entries: $(python3 -c "import zipfile;print(len(zipfile.ZipFile('$WORK/all.zip').namelist()))")"
curl -sf "$B/api/studio/$TOKEN/download?favorites=1" -o "$WORK/fav.zip"; echo "favorites zip entries: $(python3 -c "import zipfile;print(len(zipfile.ZipFile('$WORK/fav.zip').namelist()))")"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/studio/$TOKEN/submit" -H 'Content-Type: application/json' -d '{"subject":"woman","attire":"style_default","styles":[],"consent":true}')
echo "double submit -> $code (expect 400)"

echo "== starter order: brand kit gated, 4 styles"
URL=$(curl -sf -X POST "$B/api/checkout" -H 'Content-Type: application/json' -d '{"kind":"order","plan":"starter"}' | j "d['url']")
T2=$(curl -s -o /dev/null -w "%{redirect_url}" "$URL" | sed -E 's#.*/studio/([^?]+).*#\1#')
for i in $(seq 1 8); do curl -sf -F "file=@$WORK/face.png;type=image/png" "$B/api/studio/$T2/uploads" > /dev/null; done
curl -sf -X POST "$B/api/studio/$T2/submit" -H 'Content-Type: application/json' -d '{"subject":"man","attire":"formal","styles":["studio-gray","coastal","downtown","open-house","black-white"],"consent":true}' > /dev/null
curl -sf "$B/api/studio/$T2/status" | j "d['status'], 'photos', len(d['photos']), sorted(set(p['style'] for p in d['photos']))"
echo "starter brand kit -> $(curl -s -o /dev/null -w "%{http_code}" "$B/api/brand-kit/$T2/just-listed") (expect 403)"

echo "== team"
URL=$(curl -sf -X POST "$B/api/checkout" -H 'Content-Type: application/json' -d '{"kind":"team","teamName":"Triangle Home Group","email":"broker@example.com","seats":5,"teamStyle":"brand-backdrop","backdropColor":"forest"}' | j "d['url']")
echo "4 seats rejected -> $(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/checkout" -H 'Content-Type: application/json' -d '{"kind":"team","teamName":"X Team","email":"b@example.com","seats":4}') (expect 400)"
TEAMLOC=$(curl -s -o /dev/null -w "%{redirect_url}" "$URL"); echo "team dashboard: $TEAMLOC"
JOIN=$(curl -sf "$TEAMLOC" | grep -oE '/join/[A-Z0-9]+' | head -1); echo "join link: $JOIN"
CODE=${JOIN#/join/}
A1=$(curl -sf -X POST "$B/api/join/$CODE" -H 'Content-Type: application/json' -d '{"email":"a1@example.com","fullName":"Agent One"}' | j "d['token']")
A1b=$(curl -sf -X POST "$B/api/join/$CODE" -H 'Content-Type: application/json' -d '{"email":"A1@example.com","fullName":"Agent One"}' | j "d['token']")
[ "$A1" = "$A1b" ] && echo "same agent rejoin returns same studio: ok"
for n in 2 3 4 5; do curl -sf -X POST "$B/api/join/$CODE" -H 'Content-Type: application/json' -d "{\"email\":\"a$n@example.com\",\"fullName\":\"Agent $n\"}" > /dev/null; done
echo "6th agent -> $(curl -s -X POST "$B/api/join/$CODE" -H 'Content-Type: application/json' -d '{"email":"a6@example.com","fullName":"Agent Six"}')"
curl -sf "$B/api/studio/$A1/status" | j "'team agent status', d['status']"

echo "== subscription"
URL=$(curl -sf -X POST "$B/api/checkout" -H 'Content-Type: application/json' -d '{"kind":"subscription","email":"sub@example.com"}' | j "d['url']")
ACC=$(curl -s -o /dev/null -w "%{redirect_url}" "$URL" | sed -E 's#.*/account/([^?]+).*#\1#')
S1=$(curl -sf -X POST "$B/api/account/$ACC/shoot" | j "d['token']"); echo "first shoot studio: ${S1:0:8}…"
echo "second shoot too soon -> $(curl -s -X POST "$B/api/account/$ACC/shoot")"

echo "== free tool + lead"
R=$(curl -sf -F "email=lead@example.com" -F "fullName=Lee Lead" -F "brokerage=Coastal Realty" -F "address=1 Beach Rd" -F "price=\$300,000" -F "photo=@$WORK/face.png;type=image/png" "$B/api/free-graphic" | j "d['url']")
echo "free graphic -> $(curl -s -o /dev/null -w "%{http_code} %{content_type}" "$R")"
echo "tampered signature -> $(curl -s -o /dev/null -w "%{http_code}" "${R/Lee/Bob}") (expect 403)"

echo "== security"
echo "fal webhook bad sig -> $(curl -s -o /dev/null -w "%{http_code}" -X POST "$B/api/webhooks/fal?kind=gen&id=x&sig=bad" -d '{}') (expect 403)"
echo "bad token -> $(curl -s -o /dev/null -w "%{http_code}" "$B/studio/not-a-real-token-123456") (expect 404)"
echo "files traversal -> $(curl -s -o /dev/null -w "%{http_code}" "$B/api/files/..%2F..%2Fpackage.json") (expect 404)"
echo "SEO: sitemap urls $(curl -sf "$B/sitemap.xml" | grep -c "<loc>"), city page $(curl -s -o /dev/null -w "%{http_code}" "$B/realtor-headshots/youngsville-nc")"
echo "Brand kit images saved in $WORK"
if [ "${E2E_PURGE:-}" = "1" ]; then
  echo "== purge (dev server only)"
  curl -sf "$B/api/cron/cleanup?days=0"; echo
  echo "generated headshot after purge -> $(curl -s -o /dev/null -w "%{http_code}" "$(curl -sf "$B/api/studio/$TOKEN/status" | j "d['photos'][0]['url']")") (photos kept: expect 200)"
fi
