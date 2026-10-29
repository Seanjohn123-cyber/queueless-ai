# Vercel deployment

The app's production build has been checked locally with `npm run build`. Vercel CLI is not installed or authenticated in this environment, so the first deployment must be linked to your Vercel account.

From PowerShell in the project root:

```powershell
npx vercel login
npx vercel
```

Follow the prompts to authenticate and link/create the project. The first command deploys a preview. When ready to publish:

```powershell
npx vercel --prod
```

In the Vercel project settings, add these server-side environment variables for Preview and Production:

- `NEBIUS_API_KEY` — your Token Factory key
- `NEBIUS_BASE_URL` — `https://api.tokenfactory.nebius.com/v1/`
- `NEBIUS_MODEL` — `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`

Do not use a `NEXT_PUBLIC_` prefix for the key. Redeploy after adding or changing environment variables.

Visit reports currently append to a local JSONL file during local development. The report API intentionally returns “storage is not configured” on Vercel; configure durable storage before accepting deployed reports or using them for queue estimates.
