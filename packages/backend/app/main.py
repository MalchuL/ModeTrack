"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Include API routers
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Personal Productivity App API",
        "version": settings.app_version,
        "docs": "/docs",
    }


# Application startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    from app.core.database import init_db
    
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Data directory: {settings.data_dir.absolute()}")
    
    # Initialize database
    try:
        init_db()
        # Initialize default data
        from app.initial_data import init
        init()
    except Exception as e:
        print(f"Warning: Database initialization skipped - {e}")
        print("Models may not be imported yet")


# Application shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    print(f"Shutting down {settings.app_name}")
