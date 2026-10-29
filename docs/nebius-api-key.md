# Get a Nebius Token Factory API key

1. Sign in at [Nebius Token Factory](https://tokenfactory.nebius.com/).
2. Select the project that should own/bill the inference usage.
3. Open **API keys**, choose **Create API key**, and copy the key when it is shown. Keep it private; the console may only show the secret at creation.
4. Set `NEBIUS_API_KEY` in the root `.env.local` file. It is ignored by Git. Do not paste the key into chat.
5. The project is configured for `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` at `https://api.tokenfactory.nebius.com/v1/`.
6. Install dependencies with `python -m pip install -r requirements.txt`, then run `python scripts/nebius_smoke.py`.

The smoke script sends one chat-completions request with a short prompt and prints only the user-facing answer plus finish status. Nemotron may use completion tokens for reasoning before producing its answer, so the smoke request allows 1,024 completion tokens and reports an error if the response has no message content. It uses the Python OpenAI SDK and reads credentials from `.env.local`.

Token Factory documents the OpenAI-compatible API at [its API reference](https://api.tokenfactory.nebius.com/docs). The Responses API is also available at `/v1/responses` if we decide to use that interface later.
