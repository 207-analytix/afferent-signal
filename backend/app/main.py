from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.v1.routes import router
from app.core.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Afferent Signal API starting up")
    yield
    logger.info("Afferent Signal API shutting down")
    await engine.dispose()


app = FastAPI(
    title="Afferent Signal API",
    version="1.0.0",
    description="Hyper-local consumer retail intent platform — 207 Analytix",
    lifespan=lifespan,
    # RULE: ops routes are never documented to consumer-facing clients
    docs_url="/ops/docs",
    redoc_url="/ops/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://afferent.207analytix.com",  # update for production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "afferent-signal-api"}
