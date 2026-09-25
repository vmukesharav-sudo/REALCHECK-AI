"""
FastAPI Main Application for RealCheck AI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

app = FastAPI(
    title="REALCHECK AI Forensic Analysis Platform",
    description="Explainable Digital Media Authenticity & Forensic Analysis Platform",
    version="1.0.0"
)

# Enable CORS for local frontend Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "platform": "REALCHECK AI",
        "tagline": "Don't just detect. Investigate, explain, and verify.",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
