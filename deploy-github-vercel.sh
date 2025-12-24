#!/bin/bash

# Slane - GitHub → Vercel Deployment Script
# This script helps you deploy via GitHub integration with Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

echo "========================================"
echo "🚀 SLANE - GITHUB → VERCEL DEPLOYMENT"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
    log_error "This script must be run from the Slane project root directory"
    exit 1
fi

log_info "Repository: https://github.com/shivanagendrak/slane"
log_info "Deployment method: GitHub → Vercel Integration"
echo ""

# Step 1: Check Git status
log_step "1. Checking Git repository status..."

if ! git rev-parse --git-dir &> /dev/null; then
    log_error "Not a Git repository"
    exit 1
fi

if ! git remote get-url origin &> /dev/null; then
    log_error "No Git remote configured"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
log_success "Git remote: $REMOTE_URL"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
    log_warning "Uncommitted changes detected"
    echo ""
    
    read -p "Do you want to commit and push changes? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Adding and committing changes..."
        git add .
        
        echo -n "Enter commit message (or press Enter for default): "
        read commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="feat: Update deployment configuration"
        fi
        
        git commit -m "$commit_message"
        log_success "Changes committed"
    else
        log_warning "Proceeding with uncommitted changes..."
    fi
fi

# Step 2: Push to GitHub
log_step "2. Pushing to GitHub..."

CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

if git push origin $CURRENT_BRANCH; then
    log_success "Code pushed to GitHub successfully! 🎉"
else
    log_error "Failed to push to GitHub"
    exit 1
fi

echo ""

# Step 3: Vercel setup instructions
log_step "3. Vercel Integration Setup"
echo ""

echo "Now you need to connect your GitHub repository to Vercel:"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. 🌐 Visit Vercel Dashboard:"
echo "   → https://vercel.com/dashboard"
echo ""
echo "2. ➕ Create New Project:"
echo "   → Click 'Add New' → 'Project'"
echo "   → Click 'Import Git Repository'"
echo "   → Select: shivanagendrak/slane"
echo "   → Click 'Import'"
echo ""
echo "3. ⚙️  Configure Project (auto-detected):"
echo "   → Framework: Next.js"
echo "   → Build Command: npm run build"
echo "   → Output Directory: .next"
echo ""
echo "4. 🔐 Add Environment Variables:"
echo "   → Go to Project Settings → Environment Variables"
echo "   → Add these REQUIRED variables:"
echo "      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "5. 🚀 Deploy:"
echo "   → Click 'Deploy'"
echo "   → Wait for build to complete"
echo ""

echo "6. ✅ GitHub Integration Complete"
echo "   → Once connected, every push to 'main/master' will auto-deploy"
echo "   → Pull requests will create preview deployments"
echo ""

# Step 4: Supabase configuration
log_step "4. Supabase Configuration"
echo ""
echo "📋 UPDATE SUPABASE SETTINGS:"
echo ""
echo "1. 🌐 Go to Supabase Dashboard:"
echo "   → https://app.supabase.com/"
echo "   → Select your project"
echo ""
echo "2. ⚙️  Update Site Settings:"
echo "   → Settings → API → Site URL"
echo "   → Change to: https://your-vercel-domain.vercel.app"
echo ""
echo "3. 🔄 Add Redirect URLs:"
echo "   → Additional redirect URLs:"
echo "   → https://your-vercel-domain.vercel.app/auth/callback"
echo ""

# Step 5: GitHub Actions CI/CD
log_step "5. GitHub Actions CI/CD"
echo ""
echo "📋 AUTOMATED TESTING:"
echo ""
echo "Your repository includes GitHub Actions for automated testing."
echo "This runs automatically on every push and pull request:"
echo ""
echo "✅ Build and Test workflow:"
echo "   → Installs dependencies"
echo "   → Runs ESLint checks"
echo "   → Performs TypeScript compilation"
echo "   → Builds the application"
echo "   → Runs security audit"
echo ""
echo "No additional setup required! 🎉"
echo ""

# Final summary
echo "========================================"
echo "📊 DEPLOYMENT SUMMARY"
echo "========================================"
echo ""
log_success "✅ Code pushed to GitHub"
log_info "🔗 Repository: https://github.com/shivanagendrak/slane"
echo ""
echo "🎯 WHAT HAPPENS NEXT:"
echo ""
echo "1. 🌐 Connect your GitHub repo to Vercel (one-time setup)"
echo "2. ⚙️  Configure environment variables in Vercel dashboard"
echo "3. 🔄 Update Supabase settings with your Vercel domain"
echo ""
echo "🚀 AFTER SETUP:"
echo "• Every push to 'main/master' = automatic production deployment"
echo "• Every pull request = automatic preview deployment"
echo "• GitHub Actions = automatic testing on every push"
echo ""
log_success "🎉 Your GitHub → Vercel deployment pipeline is ready!"
