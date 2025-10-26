#!/bin/bash

echo "🚀 Building and deploying dashboard to GitHub Pages..."

cd "$(dirname "$0")"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment complete!"
    echo "🔗 Your site will be available at: https://ps600779.github.io/Delhi-NCR-Noise-Pollution-Analysis/"
    echo "⏱️  GitHub Pages may take 1-2 minutes to update."
else
    echo "❌ Deployment failed!"
    exit 1
fi
