#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BUCKET_NAME=example.com CF_DIST_ID=E123ABC ./deploy.sh
# Optional:
#   DIST_DIR=./dist RELEASES_DIR=./releases INVALIDATE_PATHS="/*" ./deploy.sh

DIST_DIR="${DIST_DIR:-./dist}"
RELEASES_DIR="${RELEASES_DIR:-./releases}"
BUCKET_NAME="${BUCKET_NAME:-}"
CF_DIST_ID="${CF_DIST_ID:-}"
INVALIDATE_PATHS="${INVALIDATE_PATHS:-/*}"

if [[ -z "$BUCKET_NAME" || -z "$CF_DIST_ID" ]]; then
  echo "ERROR: BUCKET_NAME and CF_DIST_ID are required."
  echo "Example: BUCKET_NAME=example.com CF_DIST_ID=E123ABC ./deploy.sh"
  exit 1
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "ERROR: DIST_DIR not found: $DIST_DIR"
  exit 1
fi

# Timestamped snapshot for rollback/debug visibility.
STAMP="$(date +%Y%m%d-%H%M%S)"
RELEASE_PATH="$RELEASES_DIR/$STAMP"
mkdir -p "$RELEASE_PATH"
cp -R "$DIST_DIR"/. "$RELEASE_PATH"/

echo "[1/3] Syncing static assets to s3://$BUCKET_NAME (private objects)..."
# Keep objects private so direct S3 access is blocked; CloudFront serves content.
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" --delete --acl private

echo "[2/3] Creating CloudFront invalidation for paths: $INVALIDATE_PATHS"
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "$INVALIDATE_PATHS" >/dev/null

echo "[3/3] Done. Release snapshot: $RELEASE_PATH"
echo "Tip: If your assets are fingerprinted (hashed), invalidate only /index.html"
