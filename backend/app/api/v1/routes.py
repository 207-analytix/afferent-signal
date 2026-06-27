from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.models.schemas import (
    RawIntakePayload,
    SignalCaptureResponse,
    ConsumerSubmission,
    ConsumerSubmissionResponse,
    ConsumerRequestView,
    CampaignView,
)
from app.services.gemini_triage import gemini_service

router = APIRouter()

# Status label map — mirrors frontend status-map.ts
STATUS_LABELS: dict[str, str] = {
    "PENDING_MANUAL_TRIAGE": "Under review — we'll update the status soon.",
    "OUT_OF_STOCK": "This item may be out of stock at your store.",
    "PRODUCT_REQUEST": "Your product request is in the queue.",
    "LOCATION_INQUIRY": "We're checking availability near you.",
    "PENDING": "Under review",
    "ACTIVE": "Being reviewed by your store",
    "FULFILLED": "Great news! Now available at your store!",
    "CLOSED": "Request closed",
}


def safe_status_label(raw_status: str) -> str:
    """Always translate raw DB status — never expose raw strings to consumers."""
    return STATUS_LABELS.get(raw_status, "Status updating...")


# ── OPS ONLY — signal ingestion route ────────────────────────────────────────
# RULE: This endpoint is internal. Never call it from the consumer app.

@router.post("/signals/capture", response_model=SignalCaptureResponse)
async def capture_signal(
    payload: RawIntakePayload,
    db: AsyncSession = Depends(get_db),
):
    """Ingest a raw signal, run Gemini triage, persist to intent_signals."""
    extracted = await gemini_service.extract_signal(payload.raw_input)

    signal_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    await db.execute(
        text("""
            INSERT INTO intent_signals (
                signal_id, store_id, timestamp, raw_input,
                ai_extracted_category, ai_extracted_brand,
                ai_descriptors, intent_type, urgency_score,
                processing_status
            ) VALUES (
                :signal_id, :store_id, :timestamp, :raw_input,
                :category, :brand, :descriptors::jsonb,
                :intent_type, :urgency_score, :status
            )
        """),
        {
            "signal_id": signal_id,
            "store_id": payload.store_id,
            "timestamp": now,
            "raw_input": payload.raw_input,
            "category": extracted.ai_extracted_category,
            "brand": extracted.ai_extracted_brand,
            "descriptors": str(extracted.ai_descriptors or {}),
            "intent_type": extracted.intent_type or payload.intent_type,
            "urgency_score": extracted.urgency_score,
            "status": "PENDING_MANUAL_TRIAGE",
        },
    )
    await db.commit()

    # RULE: urgency_score and processing_status returned here are ops-only
    return SignalCaptureResponse(
        signal_id=signal_id,
        processing_status="PENDING_MANUAL_TRIAGE",
        urgency_score=extracted.urgency_score,
    )


# ── CONSUMER — product request submission ────────────────────────────────────

@router.post("/consumer/submit", response_model=ConsumerSubmissionResponse)
async def submit_product_request(
    payload: ConsumerSubmission,
    db: AsyncSession = Depends(get_db),
):
    """Consumer submits a product request. Returns consumer-safe response only."""
    request_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    await db.execute(
        text("""
            INSERT INTO product_requests (
                request_id, user_id, store_id,
                product_name, brand_name, upc,
                user_note, status, submitted_at
            ) VALUES (
                :request_id, :user_id::uuid, :store_id,
                :product_name, :brand_name, :upc,
                :user_note, 'PENDING', :submitted_at
            )
        """),
        {
            "request_id": request_id,
            "user_id": payload.user_id,
            "store_id": payload.store_id,
            "product_name": payload.product_name,
            "brand_name": payload.brand_name,
            "upc": payload.upc,
            "user_note": payload.user_note,
            "submitted_at": now,
        },
    )
    await db.commit()

    # RULE: never return raw 'PENDING' — always translate
    return ConsumerSubmissionResponse(
        request_id=request_id,
        status_label=safe_status_label("PENDING"),
        submitted_at=now,
    )


# ── CONSUMER — fetch my requests ─────────────────────────────────────────────

@router.get("/consumer/requests/{user_id}", response_model=list[ConsumerRequestView])
async def get_my_requests(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Return consumer's own requests — ops fields stripped server-side."""
    result = await db.execute(
        text("""
            SELECT request_id, product_name, brand_name,
                   store_id, status, submitted_at
            FROM product_requests
            WHERE user_id = :user_id::uuid
            ORDER BY submitted_at DESC
            LIMIT 50
        """),
        {"user_id": user_id},
    )
    rows = result.mappings().all()

    # RULE: translate every status before returning to consumer
    return [
        ConsumerRequestView(
            request_id=str(r["request_id"]),
            product_name=r["product_name"],
            brand_name=r["brand_name"],
            store_id=r["store_id"],
            status_label=safe_status_label(r["status"]),
            submitted_at=r["submitted_at"],
        )
        for r in rows
    ]


# ── CONSUMER — campaigns list ─────────────────────────────────────────────────

@router.get("/consumer/campaigns", response_model=list[CampaignView])
async def get_campaigns(
    user_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Return active campaigns with supporter counts. Safe for consumers."""
    result = await db.execute(
        text("""
            SELECT
                c.campaign_id, c.product_name, c.brand_name,
                c.store_id, c.location_label, c.goal_count, c.status,
                COUNT(cs.user_id) AS supporter_count,
                BOOL_OR(cs.user_id = :user_id::uuid) AS is_joined
            FROM campaigns c
            LEFT JOIN campaign_supporters cs ON cs.campaign_id = c.campaign_id
            WHERE c.status = 'active'
            GROUP BY c.campaign_id
            ORDER BY supporter_count DESC
            LIMIT 20
        """),
        {"user_id": user_id or "00000000-0000-0000-0000-000000000000"},
    )
    rows = result.mappings().all()

    return [
        CampaignView(
            campaign_id=str(r["campaign_id"]),
            product_name=r["product_name"],
            brand_name=r["brand_name"],
            store_id=r["store_id"],
            location_label=r["location_label"],
            goal_count=r["goal_count"],
            supporter_count=r["supporter_count"] or 0,
            status=r["status"],
            is_joined=r["is_joined"] or False,
        )
        for r in rows
    ]
