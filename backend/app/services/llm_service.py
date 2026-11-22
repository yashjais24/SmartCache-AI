import httpx

from app.core.config import settings


class LLMService:
    def __init__(self):
        self.base_url = settings.LLM_BASE_URL.rstrip("/")
        self.api_key = settings.LLM_API_KEY

    async def generate(self, prompt: str, model: str):
        if not self.api_key:
            raise RuntimeError(
                "LLM API key is missing. Configure LLM_API_KEY in .env"
            )

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers
                )

                response.raise_for_status()

                data = response.json()

                choices = data.get("choices", [])

                if not choices:
                    raise RuntimeError(
                        "The LLM provider returned an empty response."
                    )

                message = choices[0].get("message", {})
                generated_text = message.get("content", "")

                if not generated_text:
                    raise RuntimeError(
                        "The model generated an empty response."
                    )

                usage = data.get("usage", {})

                return {
                    "response": generated_text,
                    "model": data.get("model", model),
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0)
                }

        except httpx.ConnectError:
            raise RuntimeError(
                "Could not connect to the LLM provider."
            )

        except httpx.TimeoutException:
            raise RuntimeError(
                "The LLM request timed out. Try again."
            )

        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code

            if status == 401:
                raise RuntimeError(
                    "Invalid LLM API key. Check your .env file."
                )

            if status == 402:
                raise RuntimeError(
                    "Insufficient API credits or payment required."
                )

            if status == 429:
                raise RuntimeError(
                    "LLM rate limit reached. Please try again later."
                )

            error_text = exc.response.text[:500]

            raise RuntimeError(
                f"LLM provider error ({status}): {error_text}"
            )


llm_service = LLMService()