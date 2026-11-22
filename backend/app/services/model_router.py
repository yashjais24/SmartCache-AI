from app.core.config import settings


class ModelRouter:
    def classify_query(self, query: str):
        query_lower = query.lower().strip()

        complex_keywords = [
            "explain in detail",
            "step by step",
            "analyze",
            "analysis",
            "compare",
            "difference between",
            "why",
            "prove",
            "derive",
            "implement",
            "write code",
            "debug",
            "algorithm",
            "architecture",
            "design",
            "research",
            "evaluate",
            "optimize",
            "complexity",
            "pros and cons",
            "advantages and disadvantages"
        ]

        if any(keyword in query_lower for keyword in complex_keywords):
            return "complex"

        if len(query.split()) > 25:
            return "complex"

        return "simple"

    def select_model(self, query: str):
        complexity = self.classify_query(query)

        if complexity == "complex":
            return settings.LLM_LARGE_MODEL

        return settings.LLM_SMALL_MODEL

    def get_routing_info(self, query: str):
        complexity = self.classify_query(query)
        model = self.select_model(query)

        return {
            "complexity": complexity,
            "model": model
        }


model_router = ModelRouter()