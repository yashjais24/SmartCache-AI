import httpx
import numpy as np

from app.core.config import settings


class EmbeddingService:

    def __init__(self):
        self.model = "@cf/baai/bge-small-en-v1.5"
        self.base_url = (
            f"https://api.cloudflare.com/client/v4/accounts/"
            f"{settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/{self.model}"
        )

    def generate_embeddings(self, texts: list[str]):
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        headers = {
            "Authorization": f"Bearer {settings.CLOUDFLARE_API_TOKEN}",
            "Content-Type": "application/json",
        }

        payload = {"text": texts}

        try:
            response = httpx.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=60.0,
            )

            response.raise_for_status()
            result = response.json()

            if not result.get("success", True):
                raise RuntimeError(
                    f"Cloudflare embedding error: {result.get('errors')}"
                )

            embeddings = np.array(
                result["result"]["data"],
                dtype=np.float32,
            )

            # Normalize vectors to unit length
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            embeddings = embeddings / np.maximum(norms, 1e-12)

            return embeddings

        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Cloudflare API returned {e.response.status_code}: "
                f"{e.response.text}"
            ) from e

        except httpx.RequestError as e:
            raise RuntimeError(
                f"Failed to connect to Cloudflare AI: {e}"
            ) from e

    def generate_embedding(self, text: str):
        embeddings = self.generate_embeddings([text])
        return embeddings[0]


# Singleton instance
embedding_service = EmbeddingService()