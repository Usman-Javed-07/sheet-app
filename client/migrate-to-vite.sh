#!/bin/bash
# Migration script from create-react-app to Vite

echo "🚀 Migrating frontend from create-react-app to Vite..."

# 1. Backup current package.json
cp package.json package.json.backup

# 2. Update package.json with Vite configuration
cat > package.json << 'EOF'
{
  "name": "sheet-app-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .jsx --fix"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.0"
  }
}
EOF

echo "✅ package.json updated"

# 3. Clean up and reinstall
echo "🔄 Cleaning up node_modules..."
rm -rf node_modules package-lock.json

echo "📦 Installing new dependencies..."
npm install

echo "✅ Migration complete!"
echo "Run 'npm run dev' to start the dev server"
