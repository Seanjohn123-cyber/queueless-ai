"""One-call Nemotron smoke test via Nebius Token Factory."""
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env.local", override=False)

api_key = os.getenv("NEBIUS_API_KEY")
if not api_key:
    sys.exit("NEBIUS_API_KEY is empty. Add the key to .env.local; its value is never printed.")

client = OpenAI(
    base_url=os.getenv("NEBIUS_BASE_URL", "https://api.tokenfactory.nebius.com/v1/"),
    api_key=api_key,
)

response = client.chat.completions.create(
    model=os.getenv("NEBIUS_MODEL", "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B"),
    messages=[
        {"role": "user", "content": "Say only: QueueLess Nemotron connection works."}
    ],
    # Nemotron may spend completion tokens on internal reasoning before its answer.
    max_tokens=1024,
    temperature=0,
)

choice = response.choices[0]
message = choice.message
if not message.content:
    sys.exit(
        "Nemotron returned no message content "
        f"(finish_reason={choice.finish_reason!r}). Increase max_tokens or check model settings."
    )

# Print the user-facing answer and status only; do not dump auxiliary reasoning fields.
print(message.content)
print(f"finish_reason={choice.finish_reason}; model={response.model}")
