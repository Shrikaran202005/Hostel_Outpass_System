from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.session import Base, engine
from backend.app.api.router import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hostel Outing Permission & Approval Management API",
    description="Production-grade API backend for Hostel Outing Management",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production could restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Hostel Outing Management API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
