# Netlify Deployment Instructions for LE WORE

## Important: Netlify UI Configuration Required

The build is failing because the **Publish Directory** is set to the repository root in Netlify's UI settings. This conflicts with the Next.js plugin.

### Steps to Fix:

1. **Go to your Netlify site dashboard**
   - Navigate to: https://app.netlify.com/sites/[your-site-name]/settings/deploys

2. **Update Build Settings**
   - Click on **"Build & deploy"** in the left sidebar
   - Click on **"Continuous Deployment"**
   - Find **"Build settings"** section
   - Click **"Edit settings"**

3. **Clear the Publish Directory**
   - Find the **"Publish directory"** field
   - **DELETE** any value in this field (it should be empty)
   - **DO NOT** set it to `.next`, `/`, or any other value
   - Leave it **completely blank**
   - The `@netlify/plugin-nextjs` will automatically handle the output directory

4. **Verify Other Settings**
   - **Build command**: Should be `npm run build` (this is set in netlify.toml)
   - **Base directory**: Should be empty or `/`
   - **Node version**: 20.11.0 (set in netlify.toml)

5. **Save and Redeploy**
   - Click **"Save"**
   - Trigger a new deploy by pushing to the `Le-wore` branch or clicking **"Trigger deploy"** → **"Deploy site"**

## Current Configuration

The project uses:
- **Next.js 15.5.15** with App Router
- **@netlify/plugin-nextjs** for deployment
- **Node 20.11.0**
- **NPM 10**

## Environment Variables

Make sure these are set in Netlify:
- All Firebase configuration variables from `.env.local`
- Any other API keys or secrets your app needs

## Troubleshooting

If the build still fails:
1. Check that the publish directory is truly empty in Netlify UI
2. Verify `netlify.toml` is committed and pushed to the `Le-wore` branch
3. Check the build logs for any other errors
4. Ensure all dependencies are in `package.json`

## Contact

If you continue to have issues, check:
- Netlify build logs: https://app.netlify.com/sites/[your-site-name]/deploys
- Next.js plugin docs: https://github.com/netlify/next-runtime
