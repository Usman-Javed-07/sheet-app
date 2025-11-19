# Migration script from create-react-app to Vite (Windows PowerShell)

$clientPath = "d:\Mars Capital\sheet app\client"
$packagePath = Join-Path $clientPath "package.json"
$backupPath = Join-Path $clientPath "package.json.backup"

# Backup
Copy-Item $packagePath $backupPath -Force

# Create new package.json content
$content = @"
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
"@

# Write file
$content | Out-File $packagePath -Encoding UTF8

# Clean up
$nodeModulesPath = Join-Path $clientPath "node_modules"
$lockPath = Join-Path $clientPath "package-lock.json"

if (Test-Path $nodeModulesPath) {
    Remove-Item $nodeModulesPath -Recurse -Force
}

if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
}

# Install
Push-Location $clientPath
npm install
Pop-Location
