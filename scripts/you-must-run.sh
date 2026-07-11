#!/usr/bin/env bash
# Steps that need YOUR Apple / Google / Expo accounts.
# Run from repo root after installing eas-cli: npm i -g eas-cli
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== 1) Expo login + link project ==="
echo "  eas login"
echo "  eas init   # writes real projectId into app config"
echo ""
echo "=== 2) EAS secrets (Premium token — NOT OpenRouter key) ==="
echo "  eas secret:create --name EXPO_PUBLIC_VERDANT_PREMIUM_TOKEN --value \"\$(grep PREMIUM workers/verdant-ai/.dev.vars | cut -d= -f2-)\" --scope project"
echo "  eas secret:create --name EXPO_PUBLIC_EAS_PROJECT_ID --value \"<project-id-from-eas-init>\" --scope project"
echo ""
echo "=== 3) Store products (App Store Connect + Play Console) ==="
echo "  Yearly:  com.verdant.plantcare.premium.yearly"
echo "  Lifetime: com.verdant.plantcare.premium.lifetime"
echo ""
echo "=== 4) Build & submit ==="
echo "  eas build --profile production --platform ios"
echo "  eas build --profile production --platform android"
echo "  eas submit --profile production --platform all"
echo ""
echo "=== 5) Listing ==="
echo "  Paste copy from docs/STORE_LISTING.md"
echo "  Privacy: docs/legal/PRIVACY.md URL"
echo "  Feature graphic: assets/store/feature-graphic.png"
echo ""
echo "OpenRouter key stays only on Cloudflare: cd workers/verdant-ai && npx wrangler secret put OPENROUTER_API_KEY"
