#!/usr/bin/env python3
"""
FastAPI server for photo verification endpoints
Integrates with the PhotoVerificationService
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import tempfile
import shutil
from datetime import datetime
from typing import Optional, Dict, Any
import json

from photo_verification import PhotoVerificationService, TaskRequirements, VerificationResult

# Initialize FastAPI app
app = FastAPI(
    title="Civitas Photo Verification API",
    description="API for verifying task submission photos",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize verification service
verification_service = PhotoVerificationService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Civitas Photo Verification API", "status": "running"}

@app.post("/verify-photo")
async def verify_photo(
    file: UploadFile = File(...),
    task_type: str = Form(...),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    location_radius: float = Form(default=100),
    deadline_start: str = Form(...),
    deadline_end: str = Form(...),
    user_id: str = Form(...),
    requires_video: bool = Form(default=False)
):
    """
    Verify uploaded photo for task submission
    
    Args:
        file: Image file to verify
        task_type: Type of task (tree_planting, pollution_report, etc.)
        location_lat: Task location latitude
        location_lng: Task location longitude
        location_radius: Acceptable radius in meters
        deadline_start: Task deadline start (ISO format)
        deadline_end: Task deadline end (ISO format)
        user_id: User ID for watermarking
        requires_video: Whether task requires video
    
    Returns:
        Verification result with score and issues
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        try:
            # Parse deadline dates
            deadline_start_dt = datetime.fromisoformat(deadline_start.replace('Z', '+00:00'))
            deadline_end_dt = datetime.fromisoformat(deadline_end.replace('Z', '+00:00'))
            
            # Create task requirements
            task_requirements = TaskRequirements(
                task_type=task_type,
                required_objects=[],  # Will be populated based on task type
                location_coordinates=(location_lat, location_lng),
                location_radius_meters=location_radius,
                deadline_start=deadline_start_dt,
                deadline_end=deadline_end_dt,
                requires_video=requires_video
            )
            
            # Run verification
            result = verification_service.verify_photo(
                image_path=temp_path,
                task_requirements=task_requirements,
                user_id=user_id,
                submission_time=datetime.now()
            )
            
            # Convert result to dict for JSON response
            response_data = {
                "is_valid": result.is_valid,
                "score": result.score,
                "issues": result.issues,
                "metadata": result.metadata,
                "ai_checks": result.ai_checks,
                "recommendations": result.recommendations,
                "verification_timestamp": datetime.now().isoformat()
            }
            
            return JSONResponse(content=response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/verify-multiple-photos")
async def verify_multiple_photos(
    files: list[UploadFile] = File(...),
    task_type: str = Form(...),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    location_radius: float = Form(default=100),
    deadline_start: str = Form(...),
    deadline_end: str = Form(...),
    user_id: str = Form(...)
):
    """
    Verify multiple photos for task submission
    """
    try:
        results = []
        
        for file in files:
            if not file.content_type.startswith('image/'):
                results.append({
                    "filename": file.filename,
                    "error": "File must be an image"
                })
                continue
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
                shutil.copyfileobj(file.file, temp_file)
                temp_path = temp_file.name
            
            try:
                # Parse deadline dates
                deadline_start_dt = datetime.fromisoformat(deadline_start.replace('Z', '+00:00'))
                deadline_end_dt = datetime.fromisoformat(deadline_end.replace('Z', '+00:00'))
                
                # Create task requirements
                task_requirements = TaskRequirements(
                    task_type=task_type,
                    required_objects=[],
                    location_coordinates=(location_lat, location_lng),
                    location_radius_meters=location_radius,
                    deadline_start=deadline_start_dt,
                    deadline_end=deadline_end_dt,
                    requires_video=False
                )
                
                # Run verification
                result = verification_service.verify_photo(
                    image_path=temp_path,
                    task_requirements=task_requirements,
                    user_id=user_id,
                    submission_time=datetime.now()
                )
                
                results.append({
                    "filename": file.filename,
                    "is_valid": result.is_valid,
                    "score": result.score,
                    "issues": result.issues,
                    "recommendations": result.recommendations
                })
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
        
        # Calculate overall verification result
        valid_photos = [r for r in results if r.get('is_valid', False)]
        overall_score = sum(r.get('score', 0) for r in valid_photos) / len(valid_photos) if valid_photos else 0
        overall_valid = len(valid_photos) == len(files) and overall_score >= 70
        
        return JSONResponse(content={
            "overall_valid": overall_valid,
            "overall_score": overall_score,
            "total_photos": len(files),
            "valid_photos": len(valid_photos),
            "results": results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch verification failed: {str(e)}")

@app.post("/extract-metadata")
async def extract_metadata(file: UploadFile = File(...)):
    """
    Extract EXIF metadata from uploaded image
    """
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        try:
            from PIL import Image
            image = Image.open(temp_path)
            
            # Extract metadata using the service
            metadata = verification_service._extract_exif_metadata(image)
            
            return JSONResponse(content={
                "filename": file.filename,
                "metadata": metadata,
                "extraction_timestamp": datetime.now().isoformat()
            })
            
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metadata extraction failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Photo Verification Service"
    }

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "photo_verification_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
