#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "── Trips Frontend Deploy ──"

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing globally..."
    npm install -g pm2
fi

pm2 reload ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ Frontend deployed on http://localhost:3000"
echo "   pm2 logs trips-frontend"
