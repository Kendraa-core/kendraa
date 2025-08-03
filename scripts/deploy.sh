#!/bin/bash

# Production Deployment Script for Kendraa
# This script automates the deployment process

set -e

echo "🚀 Starting Kendraa Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Please create it with your environment variables."
    echo "Required variables:"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  NEXT_PUBLIC_APP_URL"
    exit 1
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Type checking
print_status "Running TypeScript type checking..."
npm run type-check

# Linting
print_status "Running ESLint..."
npm run lint

# Build the application
print_status "Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    print_status "✅ Build completed successfully!"
    
    # Show build statistics
    echo ""
    print_status "Build Statistics:"
    echo "  - Total pages: $(find .next/server/pages -name "*.js" | wc -l)"
    echo "  - Bundle size: $(du -sh .next | cut -f1)"
    
    # Check for common issues
    echo ""
    print_status "Running post-build checks..."
    
    # Check for large files
    LARGE_FILES=$(find .next -name "*.js" -size +1M | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        print_warning "Found $LARGE_FILES large JavaScript files (>1MB)"
    fi
    
    # Check for environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        print_status "✅ Supabase URL configured"
    else
        print_warning "⚠️  Supabase URL not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        print_status "✅ Supabase key configured"
    else
        print_warning "⚠️  Supabase key not found in .env.local"
    fi
    
    echo ""
    print_status "🎉 Deployment ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy to your hosting platform:"
    echo "     - Vercel: vercel --prod"
    echo "     - Netlify: netlify deploy --prod"
    echo "     - Railway: git push railway main"
    echo ""
    echo "  2. Set environment variables in your hosting platform"
    echo "  3. Configure your domain"
    echo "  4. Test the application"
    
else
    print_error "❌ Build failed!"
    exit 1
fi 