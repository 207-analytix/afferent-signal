import google.generativeai as genai
import json
import logging
from app.models.schemas import GeminiExtractedSignal
from app.core.database import settings

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"  # RULE: never change this model name

SYSTEM_PROMPT = """
You are a retail intent signal classifier for a hyper-local consumer demand platform.
Extract structured intent data from a raw consumer input string.

Return ONLY valid JSON with these fields:
- ai_extracted_category (string): product category, e.g. "Dairy", "Beverages", "Snacks"
- ai_extracted_brand (string or null): brand name if identifiable
- ai_descriptors (object): key product attributes, e.g. {"size": "32oz", "diet": "vegan"}
- urgency_score (integer 1-5): 1=casual mention, 5=urgent repeated need
- intent_type (string): one of PRODUCT_REQUEST | OUT_OF_STOCK | LOCATION_INQUIRY | GENERAL

Do not include any explanation. Return only the JSON object.
"""


class GeminiTriageService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)

    async def extract_signal(self, raw_input: str) -> GeminiExtractedSignal:
        prompt = f"{SYSTEM_PROMPT}\n\nRaw input: {raw_input}"
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            data = json.loads(text)
            return GeminiExtractedSignal(**data)
        except Exception as exc:
            logger.warning("Gemini triage failed: %s", exc)
            # Safe fallback — never crash the ingestion pipeline
            return GeminiExtractedSignal(
                urgency_score=1,
                intent_type="PRODUCT_REQUEST",
            )


# Module-level singleton
gemini_service = GeminiTriageService()
