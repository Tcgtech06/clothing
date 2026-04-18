# Netlify Deployment Guide

## ✅ What I Fixed

1. **Added explicit build command** in `netlify.toml`:
   - `npm install --legacy-peer-deps && npm run build`
   - This ensures dependencies are installed before building

2. **Set Node version** to 18 in environment variables

3. **Added `.npmrc`** with `legacy-peer-deps=true` for dependency resolution

4. **Added `.nvmrc`** to specify Node 18

5. **Configured static export** in `next.config.ts` with `output: 'export'`

## 🚀 Netlify Settings

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

## 📋 Manual Netlify Configuration (if needed)

If you need to configure manually in Netlify UI:

1. **Build command**: `npm install --legacy-peer-deps && npm run build`
2. **Publish directory**: `out`
3. **Node version**: 18 (set in Environment Variables)

### Environment Variables in Netlify:
- Key: `NODE_VERSION`, Value: `18`
- Key: `NPM_FLAGS`, Value: `--legacy-peer-deps`

## 🔍 Troubleshooting

### If build still fails:

1. **Check the full build log** in Netlify:
   - Go to: Deploys → Failed deploy → Show full log
   - Look for the actual error message after "Installing dependencies"

2. **Clear Netlify cache**:
   - Deploys → Trigger deploy → Clear cache and deploy site

3. **Verify the build works locally**:
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```
   - The `out` folder should be created
   - Check if all pages are generated

4. **Check Node version**:
   - Netlify should use Node 18 (specified in `.nvmrc`)
   - If it uses a different version, set it in Netlify UI

## 📁 Project Structure

```
ecommerce-pwa/
├── .nvmrc              # Node version (18)
├── .npmrc              # npm config (legacy-peer-deps)
├── netlify.toml        # Netlify build config
├── next.config.ts      # Next.js config (output: 'export')
├── package.json        # Dependencies and scripts
└── public/
    ├── _redirects      # Routing rules
    └── _headers        # Security headers
```

## ✨ After Successful Deploy

Your site will be available at: `https://[your-site-name].netlify.app`

### Features:
- ✅ Static export (fast loading)
- ✅ All pages pre-rendered
- ✅ PWA manifest included
- ✅ Responsive navigation
- ✅ Hero slideshow with auto-play

## 🔄 Future Deployments

Every push to the `main` branch will automatically trigger a new Netlify build.

## 📞 Still Having Issues?

If the build still fails, please share:
1. The **full build log** from Netlify (not just the first 8 lines)
2. The exact error message shown
3. Screenshot of Netlify build settings

The current configuration should work. The key changes:
- Explicit install command with `--legacy-peer-deps`
- Node 18 environment
- Static export enabled
- Proper publish directory (`out`)
