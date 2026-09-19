#!/bin/sh
# Point the site at its live domain. Run once, from the site root.
#   ./set-domain.sh https://www.your-domain.com
set -e

ORIGIN="$1"
if [ -z "$ORIGIN" ]; then
  echo "usage: ./set-domain.sh https://www.your-domain.com" >&2
  exit 1
fi
ORIGIN=$(printf '%s' "$ORIGIN" | sed 's|/*$||')          # strip any trailing slash
case "$ORIGIN" in https://*|http://*) ;; *)
  echo "error: include the scheme, e.g. https://www.your-domain.com" >&2; exit 1 ;;
esac
[ -f index.html ] || { echo "error: run this from the folder containing index.html" >&2; exit 1; }

# uncomment canonical + og:url, then swap the placeholder for the real origin
sed -i.bak \
  -e '/<!--DOMAINNOTE-->/,/<!--\/DOMAINNOTE-->/d' \
  -e 's|<!--CANONICAL--><!-- \(.*\) -->|\1|' \
  -e 's|<!--OGURL--><!-- \(.*\) -->|\1|' \
  -e "s|content=\"/assets/img/og-cover.jpg\"|content=\"$ORIGIN/assets/img/og-cover.jpg\"|" \
  -e "s|SITE_ORIGIN|$ORIGIN|g" \
  index.html
rm -f index.html.bak

echo "Done. index.html now points at $ORIGIN:"
grep -E 'canonical|og:url|og:image" ' index.html | sed 's/^/  /'
