#!/bin/bash

# Deploy Helper Script for Frontend

echo "🎨 Frontend Deploy Helper"
echo "========================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "⚠️  Git belum diinisialisasi!"
    echo "Jalankan command ini:"
    echo ""
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit - Frontend Brainrush'"
    echo "git branch -M main"
    echo "git remote add origin https://github.com/YOUR_USERNAME/brainrush.git"
    echo "git push -u origin main"
    echo ""
    exit 1
fi

echo "✅ Git sudah diinisialisasi"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  File .env.production tidak ditemukan!"
    echo "Buat file .env.production dengan URL backend Railway kamu:"
    echo ""
    echo "VITE_API_URL=https://your-backend-url.up.railway.app"
    echo "VITE_APP_URL=https://your-app.vercel.app"
    echo ""
    exit 1
fi

echo "✅ File .env.production ditemukan"
echo ""

# Show current env
echo "📋 Current .env.production:"
cat .env.production
echo ""

# Check if backend URL is set
if grep -q "your-backend-url" .env.production; then
    echo "⚠️  VITE_API_URL masih placeholder!"
    echo "Update dengan URL Railway backend kamu."
    echo ""
fi

# Check node_modules
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies OK"
echo ""

# Test build
echo "🔨 Testing build..."
echo ""

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build gagal! Fix error di atas dulu."
    exit 1
fi

echo ""
echo "✅ Build berhasil!"
echo ""

# Show build size
if [ -d dist ]; then
    echo "📊 Build size:"
    du -sh dist
    echo ""
fi

echo "📋 Deployment Checklist:"
echo ""
echo "1. ✅ Git initialized"
echo "2. ✅ .env.production exists"
echo "3. ✅ Dependencies installed"
echo "4. ✅ Build tested"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Pastikan VITE_API_URL di .env.production sudah benar"
echo ""
echo "2. Push ke GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push"
echo ""
echo "3. Deploy di Vercel:"
echo "   - Buka https://vercel.com"
echo "   - Login dengan GitHub"
echo "   - Add New Project → Import repository"
echo "   - Pilih repository ini"
echo "   - Framework: Vite (auto-detect)"
echo "   - Deploy!"
echo ""
echo "4. Setup Environment Variables di Vercel:"
echo "   VITE_API_URL=<Railway Backend URL>"
echo "   VITE_APP_URL=<Vercel URL>"
echo ""
echo "5. Update CLIENT_URL di Railway dengan URL Vercel"
echo ""
echo "✨ Selesai! Lihat QUICK_DEPLOY.md untuk panduan lengkap."
