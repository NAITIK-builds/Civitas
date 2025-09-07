#!/usr/bin/env python3
"""
Photo Verification Service for Civitas Task Submission
Handles EXIF metadata, AI authenticity checks, and context verification
"""

import os
import json
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import logging
from pathlib import Path

# Image processing and EXIF
from PIL import Image, ImageDraw, ImageFont
import piexif
from PIL.ExifTags import TAGS, GPSTAGS
import cv2
import numpy as np

# AI and ML libraries
import requests
from sklearn.metrics.pairwise import cosine_similarity
import imagehash
from imagehash import phash, dhash, whash

# GPS and location
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VerificationResult:
    """Result of photo verification"""
    is_valid: bool
    score: float  # 0-100
    issues: List[str]
    metadata: Dict[str, Any]
    ai_checks: Dict[str, Any]
    recommendations: List[str]

@dataclass
class TaskRequirements:
    """Task-specific verification requirements"""
    task_type: str
    required_objects: List[str]
    location_coordinates: Tuple[float, float]
    location_radius_meters: float
    deadline_start: datetime
    deadline_end: datetime
    requires_video: bool = False

class PhotoVerificationService:
    """Main photo verification service"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.api_keys = {
            'azure': os.getenv('AZURE_CONTENT_MODERATOR_KEY'),
            'hive_ai': os.getenv('HIVE_AI_KEY'),
            'google_vision': os.getenv('GOOGLE_VISION_API_KEY')
        }
        
    def verify_photo(self, 
                    image_path: str, 
                    task_requirements: TaskRequirements,
                    user_id: str,
                    submission_time: datetime) -> VerificationResult:
        """
        Main verification method for uploaded photos
        """
        try:
            # Load image
            image = Image.open(image_path)
            
            # Extract EXIF metadata
            metadata = self._extract_exif_metadata(image)
            
            # Verify timestamp
            timestamp_valid, timestamp_issues = self._verify_timestamp(
                metadata, task_requirements, submission_time
            )
            
            # Verify GPS location
            location_valid, location_issues = self._verify_location(
                metadata, task_requirements
            )
            
            # Add watermark
            watermarked_image = self._add_watermark(image, user_id, submission_time)
            watermarked_image.save(f"{image_path}_watermarked.jpg")
            
            # AI authenticity checks
            ai_results = self._run_ai_authenticity_checks(image_path)
            
            # Context verification
            context_valid, context_issues = self._verify_context(
                image_path, task_requirements
            )
            
            # Calculate overall score
            score = self._calculate_verification_score(
                timestamp_valid, location_valid, context_valid, ai_results
            )
            
            # Determine if valid
            is_valid = (score >= 70 and timestamp_valid and location_valid)
            
            # Collect all issues
            all_issues = timestamp_issues + location_issues + context_issues
            if ai_results.get('manipulation_detected'):
                all_issues.append("Image appears to be manipulated or AI-generated")
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                all_issues, task_requirements
            )
            
            return VerificationResult(
                is_valid=is_valid,
                score=score,
                issues=all_issues,
                metadata=metadata,
                ai_checks=ai_results,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Error during photo verification: {e}")
            return VerificationResult(
                is_valid=False,
                score=0,
                issues=[f"Verification error: {str(e)}"],
                metadata={},
                ai_checks={},
                recommendations=["Contact support if this error persists"]
            )
    
    def _extract_exif_metadata(self, image: Image.Image) -> Dict[str, Any]:
        """Extract EXIF metadata from image"""
        metadata = {}
        
        try:
            exif_dict = piexif.load(image.info.get("exif", b""))
            
            if exif_dict:
                # Extract basic metadata
                if "0th" in exif_dict:
                    for tag_id, value in exif_dict["0th"].items():
                        tag_name = TAGS.get(tag_id, f"Unknown_{tag_id}")
                        if isinstance(value, bytes):
                            try:
                                metadata[tag_name] = value.decode('utf-8', errors='ignore')
                            except:
                                metadata[tag_name] = str(value)
                        else:
                            metadata[tag_name] = value
                
                # Extract GPS data
                if "GPS" in exif_dict:
                    gps_data = {}
                    for tag_id, value in exif_dict["GPS"].items():
                        tag_name = GPSTAGS.get(tag_id, f"GPS_{tag_id}")
                        gps_data[tag_name] = value
                    
                    if gps_data:
                        metadata["GPS"] = gps_data
                        
                        # Convert GPS coordinates to decimal degrees
                        lat, lng = self._convert_gps_to_decimal(gps_data)
                        if lat and lng:
                            metadata["GPS_Decimal"] = {"latitude": lat, "longitude": lng}
                
                # Extract date/time
                if "DateTime" in metadata:
                    try:
                        metadata["DateTime"] = datetime.strptime(
                            metadata["DateTime"], "%Y:%m:%d %H:%M:%S"
                        )
                    except:
                        pass
                        
        except Exception as e:
            logger.warning(f"Could not extract EXIF metadata: {e}")
        
        return metadata
    
    def _convert_gps_to_decimal(self, gps_data: Dict) -> Tuple[Optional[float], Optional[float]]:
        """Convert GPS coordinates from DMS to decimal degrees"""
        try:
            # Extract latitude
            lat_ref = gps_data.get("GPSLatitudeRef", b"N").decode() if isinstance(gps_data.get("GPSLatitudeRef"), bytes) else gps_data.get("GPSLatitudeRef", "N")
            lat_dms = gps_data.get("GPSLatitude")
            if lat_dms:
                lat = self._dms_to_decimal(lat_dms)
                if lat_ref == "S":
                    lat = -lat
            else:
                lat = None
            
            # Extract longitude
            lng_ref = gps_data.get("GPSLongitudeRef", b"E").decode() if isinstance(gps_data.get("GPSLongitudeRef"), bytes) else gps_data.get("GPSLongitudeRef", "E")
            lng_dms = gps_data.get("GPSLongitude")
            if lng_dms:
                lng = self._dms_to_decimal(lng_dms)
                if lng_ref == "W":
                    lng = -lng
            else:
                lng = None
                
            return lat, lng
            
        except Exception as e:
            logger.warning(f"Error converting GPS coordinates: {e}")
            return None, None
    
    def _dms_to_decimal(self, dms_tuple) -> float:
        """Convert degrees, minutes, seconds to decimal degrees"""
        try:
            degrees = float(dms_tuple[0])
            minutes = float(dms_tuple[1])
            seconds = float(dms_tuple[2])
            
            return degrees + (minutes / 60.0) + (seconds / 3600.0)
        except:
            return 0.0
    
    def _verify_timestamp(self, 
                         metadata: Dict, 
                         task_requirements: TaskRequirements,
                         submission_time: datetime) -> Tuple[bool, List[str]]:
        """Verify photo timestamp matches task deadline window"""
        issues = []
        
        # Check if we have timestamp from EXIF
        photo_time = metadata.get("DateTime")
        if not photo_time:
            issues.append("No timestamp found in photo metadata")
            return False, issues
        
        # Check if timestamp is within deadline window
        if not (task_requirements.deadline_start <= photo_time <= task_requirements.deadline_end):
            issues.append(f"Photo timestamp {photo_time} is outside task deadline window")
            return False, issues
        
        # Check if photo was taken within 4 hours of submission (as requested)
        time_diff = submission_time - photo_time
        if time_diff > timedelta(hours=4):
            issues.append("Photo appears to be older than 4 hours - please take fresh photos")
            return False, issues
        elif time_diff > timedelta(hours=2):
            issues.append("Photo is getting old - consider taking a fresh photo")
        
        return True, issues
    
    def _verify_location(self, 
                        metadata: Dict, 
                        task_requirements: TaskRequirements) -> Tuple[bool, List[str]]:
        """Verify GPS coordinates match assigned location"""
        issues = []
        
        # Check if we have GPS coordinates
        gps_decimal = metadata.get("GPS_Decimal")
        if not gps_decimal:
            issues.append("No GPS coordinates found in photo metadata")
            return False, issues
        
        photo_lat = gps_decimal.get("latitude")
        photo_lng = gps_decimal.get("longitude")
        
        if not photo_lat or not photo_lng:
            issues.append("Invalid GPS coordinates in photo metadata")
            return False, issues
        
        # Calculate distance from assigned location
        photo_coords = (photo_lat, photo_lng)
        task_coords = task_requirements.location_coordinates
        
        distance = geodesic(photo_coords, task_coords).meters
        
        if distance > task_requirements.location_radius_meters:
            issues.append(f"Photo location is {distance:.1f}m from assigned location (max: {task_requirements.location_radius_meters}m)")
            return False, issues
        
        return True, issues
    
    def _add_watermark(self, 
                      image: Image.Image, 
                      user_id: str, 
                      timestamp: datetime) -> Image.Image:
        """Add watermark with user ID and timestamp"""
        try:
            # Create a copy to avoid modifying original
            watermarked = image.copy()
            draw = ImageDraw.Draw(watermarked)
            
            # Try to load a font, fall back to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except:
                font = ImageFont.load_default()
            
            # Create watermark text
            watermark_text = f"User: {user_id} | {timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
            
            # Calculate text size
            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Position watermark in bottom-right corner
            x = image.width - text_width - 10
            y = image.height - text_height - 10
            
            # Add semi-transparent background
            background_bbox = (x-5, y-5, x+text_width+5, y+text_height+5)
            draw.rectangle(background_bbox, fill=(0, 0, 0, 128))
            
            # Add text
            draw.text((x, y), watermark_text, fill=(255, 255, 255), font=font)
            
            return watermarked
            
        except Exception as e:
            logger.warning(f"Could not add watermark: {e}")
            return image
    
    def _run_ai_authenticity_checks(self, image_path: str) -> Dict[str, Any]:
        """Run AI-based authenticity checks"""
        results = {
            "manipulation_detected": False,
            "ai_generated": False,
            "duplicate_detected": False,
            "face_detected": False,
            "confidence_scores": {}
        }
        
        try:
            # Load image for analysis
            image = cv2.imread(image_path)
            if image is None:
                return results
            
            # Convert to RGB for face recognition
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Face detection
            # face_locations = face_recognition.face_locations(rgb_image)
            # results["face_detected"] = len(face_locations) > 0
            # results["face_count"] = len(face_locations)
            
            # Perceptual hashing for duplicate detection
            pil_image = Image.open(image_path)
            phash_value = str(phash(pil_image))
            dhash_value = str(dhash(pil_image))
            whash_value = str(whash(pil_image))
            
            results["image_hashes"] = {
                "phash": phash_value,
                "dhash": dhash_value,
                "whash": whash_value
            }
            
            # Check for common manipulation artifacts
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Error Level Analysis (ELA) - detects JPEG compression artifacts
            ela_score = self._calculate_ela_score(gray)
            results["ela_score"] = ela_score
            
            # Noise analysis
            noise_score = self._calculate_noise_score(gray)
            results["noise_score"] = noise_score
            
            # Metadata consistency check
            metadata_consistency = self._check_metadata_consistency(image_path)
            results["metadata_consistency"] = metadata_consistency
            
            # Determine if manipulation is likely
            manipulation_score = 0
            if ela_score > 0.8:
                manipulation_score += 30
            if noise_score < 0.1:
                manipulation_score += 20
            if not metadata_consistency:
                manipulation_score += 25
            
            results["manipulation_score"] = manipulation_score
            results["manipulation_detected"] = manipulation_score > 50
            
            # Try external AI services if API keys are available
            if self.api_keys.get('azure'):
                azure_results = self._azure_content_moderation(image_path)
                results.update(azure_results)
            
            if self.api_keys.get('hive_ai'):
                hive_results = self._hive_ai_detection(image_path)
                results.update(hive_results)
                
        except Exception as e:
            logger.error(f"Error in AI authenticity checks: {e}")
        
        return results
    
    def _calculate_ela_score(self, gray_image) -> float:
        """Calculate Error Level Analysis score"""
        try:
            # Apply JPEG compression and compare
            temp_path = "temp_ela.jpg"
            cv2.imwrite(temp_path, gray_image, [cv2.IMWRITE_JPEG_QUALITY, 90])
            
            compressed = cv2.imread(temp_path, cv2.IMREAD_GRAYSCALE)
            os.remove(temp_path)
            
            if compressed is not None:
                diff = cv2.absdiff(gray_image, compressed)
                score = np.mean(diff) / 255.0
                return min(score, 1.0)
            
            return 0.0
            
        except:
            return 0.0
    
    def _calculate_noise_score(self, gray_image) -> float:
        """Calculate noise level in image"""
        try:
            # Apply Gaussian blur and compare with original
            blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
            diff = cv2.absdiff(gray_image, blurred)
            noise_score = np.mean(diff) / 255.0
            return min(noise_score, 1.0)
        except:
            return 0.0
    
    def _check_metadata_consistency(self, image_path: str) -> bool:
        """Check if metadata is consistent and not tampered with"""
        try:
            # This is a simplified check - in production you'd want more sophisticated analysis
            exif_dict = piexif.load(image_path)
            
            if not exif_dict:
                return False
            
            # Check for basic required fields
            required_fields = ["0th", "Exif"]
            for field in required_fields:
                if field not in exif_dict:
                    return False
            
            return True
            
        except:
            return False
    
    def _azure_content_moderation(self, image_path: str) -> Dict[str, Any]:
        """Use Azure Content Moderator for additional checks"""
        try:
            if not self.api_keys.get('azure'):
                return {}
            
            # This would integrate with Azure Content Moderator API
            # For now, return placeholder
            return {
                "azure_moderation": "not_implemented",
                "azure_score": 0.0
            }
            
        except Exception as e:
            logger.warning(f"Azure moderation failed: {e}")
            return {}
    
    def _hive_ai_detection(self, image_path: str) -> Dict[str, Any]:
        """Use Hive AI for AI-generated image detection"""
        try:
            if not self.api_keys.get('hive_ai'):
                return {}
            
            # This would integrate with Hive AI API
            # For now, return placeholder
            return {
                "hive_ai_detection": "not_implemented",
                "hive_score": 0.0
            }
            
        except Exception as e:
            logger.warning(f"Hive AI detection failed: {e}")
            return {}
    
    def _verify_context(self, 
                       image_path: str, 
                       task_requirements: TaskRequirements) -> Tuple[bool, List[str]]:
        """Verify image context matches task requirements"""
        issues = []
        
        try:
            # Load image for object detection
            image = cv2.imread(image_path)
            if image is None:
                issues.append("Could not load image for context verification")
                return False, issues
            
            # Basic object detection (in production, use more sophisticated models)
            if task_requirements.task_type == "tree_planting":
                context_valid, context_issues = self._verify_tree_planting_context(image)
                issues.extend(context_issues)
                return context_valid, issues
            
            elif task_requirements.task_type == "pollution_report":
                context_valid, context_issues = self._verify_pollution_context(image)
                issues.extend(context_issues)
                return context_valid, issues
            
            elif task_requirements.task_type == "corruption_report":
                context_valid, context_issues = self._verify_corruption_context(image)
                issues.extend(context_issues)
                return context_valid, issues
            
            else:
                # Generic context verification
                return True, []
                
        except Exception as e:
            logger.error(f"Error in context verification: {e}")
            issues.append(f"Context verification error: {str(e)}")
            return False, issues
    
    def _verify_tree_planting_context(self, image) -> Tuple[bool, List[str]]:
        """Verify tree planting context - enhanced for tree detection"""
        issues = []
        
        # Convert to HSV for better color detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Detect green colors (trees, plants) - more specific tree detection
        # Tree green is typically in this range
        lower_green = np.array([35, 50, 50])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Detect darker green (tree trunks, branches)
        lower_dark_green = np.array([25, 30, 30])
        upper_dark_green = np.array([35, 255, 255])
        dark_green_mask = cv2.inRange(hsv, lower_dark_green, upper_dark_green)
        
        # Combine green masks
        combined_green_mask = cv2.bitwise_or(green_mask, dark_green_mask)
        
        green_pixels = cv2.countNonZero(combined_green_mask)
        total_pixels = image.shape[0] * image.shape[1]
        green_percentage = (green_pixels / total_pixels) * 100
        
        # More lenient threshold for tree detection
        if green_percentage < 3:
            issues.append("No trees or vegetation detected in the image")
        elif green_percentage < 8:
            issues.append("Very little vegetation detected - ensure trees are clearly visible")
        
        # Detect brown colors (soil, tools, tree trunks)
        lower_brown = np.array([10, 50, 50])
        upper_brown = np.array([20, 255, 255])
        brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
        
        brown_pixels = cv2.countNonZero(brown_mask)
        brown_percentage = (brown_pixels / total_pixels) * 100
        
        # Detect sky (blue) to ensure outdoor photo
        lower_blue = np.array([100, 50, 50])
        upper_blue = np.array([130, 255, 255])
        blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)
        blue_pixels = cv2.countNonZero(blue_mask)
        blue_percentage = (blue_pixels / total_pixels) * 100
        
        if blue_percentage > 20:
            issues.append("Image appears to be taken outdoors (good for tree planting)")
        
        # Use contour detection to find tree-like shapes
        contours, _ = cv2.findContours(combined_green_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        tree_like_objects = 0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # Minimum area for tree-like object
                # Check aspect ratio (trees are typically taller than wide)
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = h / w if w > 0 else 0
                if aspect_ratio > 1.2:  # Taller than wide
                    tree_like_objects += 1
        
        if tree_like_objects == 0:
            issues.append("No tree-like objects detected in the image")
        elif tree_like_objects < 2:
            issues.append("Very few tree-like objects detected - ensure trees are clearly visible")
        
        return len(issues) == 0, issues
    
    def _verify_pollution_context(self, image) -> Tuple[bool, List[str]]:
        """Verify pollution report context"""
        issues = []
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect dark areas (potential pollution)
        _, dark_mask = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
        dark_pixels = cv2.countNonZero(dark_mask)
        total_pixels = image.shape[0] * image.shape[1]
        dark_percentage = (dark_pixels / total_pixels) * 100
        
        if dark_percentage < 10:
            issues.append("Image doesn't show sufficient pollution indicators")
        
        return len(issues) == 0, issues
    
    def _verify_corruption_context(self, image) -> Tuple[bool, List[str]]:
        """Verify corruption report context"""
        # For corruption reports, context is harder to verify automatically
        # This would typically require human review
        return True, []
    
    def _calculate_verification_score(self, 
                                   timestamp_valid: bool, 
                                   location_valid: bool, 
                                   context_valid: bool, 
                                   ai_results: Dict) -> float:
        """Calculate overall verification score (0-100)"""
        score = 0
        
        # Base scores
        if timestamp_valid:
            score += 25
        if location_valid:
            score += 25
        if context_valid:
            score += 20
        
        # AI check scores
        manipulation_score = ai_results.get("manipulation_score", 0)
        if manipulation_score < 30:
            score += 20
        elif manipulation_score < 50:
            score += 10
        
        # Face detection bonus (shows human involvement)
        # if ai_results.get("face_detected"):
        #     score += 10
        
        # Metadata consistency
        if ai_results.get("metadata_consistency"):
            score += 10
        
        return min(score, 100)
    
    def _generate_recommendations(self, 
                                issues: List[str], 
                                task_requirements: TaskRequirements) -> List[str]:
        """Generate recommendations based on verification issues"""
        recommendations = []
        
        if "No timestamp found" in str(issues):
            recommendations.append("Enable location services and camera metadata when taking photos")
        
        if "GPS coordinates" in str(issues):
            recommendations.append("Ensure GPS is enabled and location permissions are granted")
        
        if "outside task deadline" in str(issues):
            recommendations.append("Take photos within the task deadline window")
        
        if "older than 24 hours" in str(issues):
            recommendations.append("Take fresh photos when completing tasks")
        
        if "manipulated or AI-generated" in str(issues):
            recommendations.append("Use original, unedited photos from your camera")
        
        if "context" in str(issues):
            recommendations.append(f"Ensure photos clearly show {task_requirements.task_type} completion")
        
        if not recommendations:
            recommendations.append("Photo meets all verification requirements")
        
        return recommendations

# Example usage and testing
if __name__ == "__main__":
    # Example configuration
    config = {
        "max_file_size": 10 * 1024 * 1024,  # 10MB
        "allowed_formats": ["jpg", "jpeg", "png"],
        "verification_timeout": 30  # seconds
    }
    
    service = PhotoVerificationService(config)
    
    # Example task requirements
    task_req = TaskRequirements(
        task_type="tree_planting",
        required_objects=["tree", "shovel", "person"],
        location_coordinates=(40.7128, -74.0060),  # NYC coordinates
        location_radius_meters=100,
        deadline_start=datetime.now() - timedelta(days=1),
        deadline_end=datetime.now() + timedelta(days=1),
        requires_video=False
    )
    
    print("Photo Verification Service initialized successfully!")
    print("Use this service to verify uploaded photos for task submissions.")
