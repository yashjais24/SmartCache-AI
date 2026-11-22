from sentence_transformers import SentenceTransformer

from app.core.config import settings


class EmbeddingService:

    def __init__(self):
        self.model = None

    def load_model(self):
        if self.model is None:
            print("Loading embedding model...")

            self.model = SentenceTransformer(
                settings.EMBEDDING_MODEL
            )

            print("Embedding model loaded!")

    def generate_embedding(self, text: str):
        self.load_model()

        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return embedding

    def generate_embeddings(self, texts: list[str]):
        self.load_model()

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        return embeddings


# Singleton instance
embedding_service = EmbeddingService()