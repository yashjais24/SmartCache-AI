
import httpx

from app.core.config import settings


class LLMService:
    def __init__(self):
        # OpenRouter
        self.openrouter_base_url = settings.LLM_BASE_URL.rstrip("/")
        self.openrouter_api_key = settings.LLM_API_KEY

        # Gemini
        self.gemini_api_key = settings.GEMINI_API_KEY

        # Groq
        self.groq_base_url = settings.GROQ_BASE_URL.rstrip("/")
        self.groq_api_key = settings.GROQ_API_KEY

    async def generate(self, prompt: str, model: str):
        model_lower = model.lower()

        # Gemini models
        if model_lower.startswith("gemini"):
            return await self._generate_gemini(prompt, model)

        # Groq models
        if model_lower.startswith("openai/") or model_lower.startswith("qwen/"):
            return await self._generate_groq(prompt, model)

        # Default: OpenRouter
        return await self._generate_openrouter(prompt, model)

    async def _generate_openrouter(self, prompt: str, model: str):
        return await self._generate_openai_compatible(
            prompt=prompt,
            model=model,
            base_url=self.openrouter_base_url,
            api_key=self.openrouter_api_key,
            provider_name="OpenRouter"
        )

    async def _generate_groq(self, prompt: str, model: str):
        if not self.groq_api_key:
            raise RuntimeError(
                "Groq API key is missing. Configure GROQ_API_KEY."
            )

        return await self._generate_openai_compatible(
            prompt=prompt,
            model=model,
            base_url=self.groq_base_url,
            api_key=self.groq_api_key,
            provider_name="Groq"
        )

    async def _generate_openai_compatible(
        self,
        prompt: str,
        model: str,
        base_url: str,
        api_key: str,
        provider_name: str
    ):
        if not api_key:
            raise RuntimeError(
                f"{provider_name} API key is missing."
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
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{base_url}/chat/completions",
                    json=payload,
                    headers=headers
                )

                response.raise_for_status()
                data = response.json()

                choices = data.get("choices", [])

                if not choices:
                    raise RuntimeError(
                        f"{provider_name} returned an empty response."
                    )

                generated_text = (
                    choices[0]
                    .get("message", {})
                    .get("content", "")
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
                f"Could not connect to {provider_name}."
            )

        except httpx.TimeoutException:
            raise RuntimeError(
                f"{provider_name} request timed out. Try again."
            )

        except httpx.HTTPStatusError as exc:
            self._handle_http_error(exc, provider_name)

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

            if status in (401, 403):
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

    def _handle_http_error(self, exc, provider_name="LLM provider"):
        status = exc.response.status_code

        if status == 401:
            raise RuntimeError(
                f"Invalid {provider_name} API key."
            )

        if status == 402:
            raise RuntimeError(
                "Insufficient API credits or payment required."
            )

        if status == 403:
            raise RuntimeError(
                f"{provider_name} access denied."
            )

        if status == 404:
            raise RuntimeError(
                f"Model not found on {provider_name}. "
                "Check the model ID."
            )

        if status == 429:
            raise RuntimeError(
                f"{provider_name} rate limit or quota reached."
            )

        error_text = exc.response.text[:500]

        raise RuntimeError(
            f"{provider_name} error ({status}): {error_text}"
        )


llm_service = LLMService()
