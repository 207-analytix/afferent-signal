from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
import uuid


# ── Ops ingestion (internal only — NEVER expose to consumers) ──────────────

class RawIntakePayload(BaseModel):
    """Payload POSTed to POST /api/v1/signals/capture by ops/backend systems."""
    store_id: str
    raw_input: str
    intent_type: Optional[str] = None


class GeminiExtractedSignal(BaseModel):
    """Structured signal extracted by Gemini triage — ops-internal only."""
    ai_extracted_category: Optional[str] = None
    ai_extracted_brand: Optional[str] = None
    ai_descriptors: Optional[dict[str, Any]] = None
    urgency_score: int = Field(default=1, ge=1, le=5)
    intent_type: Optional[str] = None


class SignalCaptureResponse(BaseModel):
    """Response from POST /api/v1/signals/capture — ops-internal only."""
    signal_id: str
    processing_status: str
    urgency_score: int


# ── Consumer-facing (safe — no AI fields, no urgency scores) ───────────────

class ConsumerSubmission(BaseModel):
    """Payload POSTed by the consumer app to submit a product request."""
    user_id: str
    store_id: str
    product_name: str
    brand_name: Optional[str] = None
    upc: Optional[str] = None
    user_note: Optional[str] = None


class ConsumerSubmissionResponse(BaseModel):
    """Safe response returned to consumer — no ops fields included."""
    request_id: str
    status_label: str  # Human-friendly label from status-map, not raw status
    submitted_at: datetime


class ConsumerRequestView(BaseModel):
    """Single request as seen by a consumer — ops fields stripped."""
    request_id: str
    product_name: str
    brand_name: Optional[str] = None
    store_id: str
    status_label: str
    submitted_at: datetime


class CampaignView(BaseModel):
    """Campaign as seen by a consumer."""
    campaign_id: str
    product_name: str
    brand_name: Optional[str] = None
    store_id: str
    location_label: Optional[str] = None
    goal_count: int
    supporter_count: int
    status: str
    is_joined: bool = False
