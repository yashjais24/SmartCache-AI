
import httpx

from app.core.config import settings


class LLMService:
    def __init__(self):
        self.base_url = settings.LLM_BASE_URL.rstrip("/")
        self.api_key = settings.LLM_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY

    async def generate(self, prompt: str, model: str):
        is_gemini = model.lower().startswith("gemini")

        if is_gemini:
            return await self._generate_gemini(prompt, model)

        return await self._generate_openrouter(prompt, model)

    async def _generate_openrouter(self, prompt: str, model: str):
        if not self.api_key:
            raise RuntimeError(
                "LLM API key is missing. Configure LLM_API_KEY."
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

                generated_text = (
                    choices[0].get("message", {}).get("content", "")
                )

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
            self._handle_http_error(exc)

    async def _generate_gemini(self, prompt: str, model: str):
        if not self.gemini_api_key:
            raise RuntimeError(
                "Gemini API key is missing. Configure GEMINI_API_KEY."
            )

        model_name = model.replace("models/", "")

        url = (
            "https://generativelanguage.googleapis.com/v1beta/"
            f"models/{model_name}:generateContent"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7
            }
        }

        headers = {
            "x-goog-api-key": self.gemini_api_key,
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )

                response.raise_for_status()
                data = response.json()

                candidates = data.get("candidates", [])

                if not candidates:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                parts = (
                    candidates[0]
                    .get("content", {})
                    .get("parts", [])
                )

                generated_text = "".join(
                    part.get("text", "")
                    for part in parts
                )

                if not generated_text:
                    raise RuntimeError(
                        "Gemini generated an empty response."
                    )

                usage = data.get("usageMetadata", {})

                prompt_tokens = usage.get(
                    "promptTokenCount", 0
                )

                completion_tokens = usage.get(
                    "candidatesTokenCount", 0
                )

                total_tokens = usage.get(
                    "totalTokenCount",
                    prompt_tokens + completion_tokens
                )

                return {
                    "response": generated_text,
                    "model": model_name,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens
                }

        except httpx.ConnectError:
            raise RuntimeError(
                "Could not connect to Gemini API."
            )

        except httpx.TimeoutException:
            raise RuntimeError(
                "Gemini request timed out. Try again."
            )

        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code

            if status == 400:
                raise RuntimeError(
                    f"Gemini invalid request: {exc.response.text[:500]}"
                )

            if status == 401 or status == 403:
                raise RuntimeError(
                    "Invalid Gemini API key or API access denied."
                )

            if status == 429:
                raise RuntimeError(
                    "Gemini rate limit or quota exceeded."
                )

            error_text = exc.response.text[:500]

            raise RuntimeError(
                f"Gemini API error ({status}): {error_text}"
            )

    def _handle_http_error(self, exc):
        status = exc.response.status_code

        if status == 401:
            raise RuntimeError(
                "Invalid LLM API key. Check your environment variables."
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
