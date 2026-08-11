from fastapi import APIRouter
from backend.app.api.auth import router as auth_router
from backend.app.api.departments import router as departments_router
from backend.app.api.hostel_blocks import router as hostel_blocks_router
from backend.app.api.outings import router as outings_router
from backend.app.api.hod import router as hod_router
from backend.app.api.warden import router as warden_router
from backend.app.api.watchman import router as watchman_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(departments_router)
api_router.include_router(hostel_blocks_router)
api_router.include_router(outings_router)
api_router.include_router(hod_router)
api_router.include_router(warden_router)
api_router.include_router(watchman_router)

