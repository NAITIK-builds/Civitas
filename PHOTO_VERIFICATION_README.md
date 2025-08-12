# Civitas Photo Verification System

A comprehensive photo verification system for task submissions that includes EXIF metadata extraction, AI authenticity checks, and context verification.

## Features

### 🔍 **Metadata & Geotag Verification**
- Extracts EXIF metadata (date, time, GPS location, camera info)
- Verifies timestamp matches task deadline window
- Validates GPS coordinates against assigned location
- Detects missing or manipulated metadata

### 📱 **Real-time Capture Requirements**
- Direct camera access from the app
- Blocks gallery uploads for certain tasks
- Optional video clip requirements for higher trust

### 🤖 **AI Image Authenticity Checks**
- Detects photoshopped or AI-generated images
- Perceptual hashing for duplicate detection
- Error Level Analysis (ELA) for manipulation detection
- Face detection and analysis
- Integration with external AI services (Azure, Hive AI)

### 🎯 **Context Verification**
- **Tree Planting**: Detects vegetation, soil, and tools
- **Pollution Reports**: Identifies pollution indicators
- **Corruption Reports**: Human review required
- Background comparison with location data

### 👥 **Human Moderator Layer**
- AI verification followed by human review
- Moderator dashboard for high-value tasks
- Approval/rejection with notes

### 🛡️ **Anti-Cheat Measures**
- Random pose verification prompts
- Watermarking with user ID and timestamp
- Trust scoring system
- Progressive verification strictness

## Architecture

```
Frontend (React) → Node.js Server → Python Verification Service
                                    ↓
                              EXIF Extraction
                              AI Analysis
                              Context Verification
                              Watermarking
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Install Python Dependencies

```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Unix/Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
npm install axios form-data multer
```

### 3. Environment Variables

Create a `.env` file in the server directory:

```env
# Python Verification Service
AZURE_CONTENT_MODERATOR_KEY=your_azure_key
HIVE_AI_KEY=your_hive_ai_key
GOOGLE_VISION_API_KEY=your_google_key

# Node.js Server
PYTHON_VERIFICATION_SERVICE_URL=http://localhost:8000
```

### 4. Start Services

#### Windows
```bash
start-services.bat
```

#### Unix/Linux/Mac
```bash
chmod +x start-services.sh
./start-services.sh
```

#### Manual Start
```bash
# Terminal 1: Python Service
cd server
python photo_verification_api.py

# Terminal 2: Node.js Server
npm run dev:server
```

## API Endpoints

### Python Verification Service (Port 8000)

#### `POST /verify-photo`
Verify a single photo for task submission.

**Parameters:**
- `file`: Image file
- `task_type`: Task type (tree_planting, pollution_report, etc.)
- `location_lat`: Task location latitude
- `location_lng`: Task location longitude
- `location_radius`: Acceptable radius in meters
- `deadline_start`: Task deadline start (ISO format)
- `deadline_end`: Task deadline end (ISO format)
- `user_id`: User ID for watermarking

**Response:**
```json
{
  "is_valid": true,
  "score": 85.5,
  "issues": [],
  "metadata": { ... },
  "ai_checks": { ... },
  "recommendations": ["Photo meets all verification requirements"]
}
```

#### `POST /verify-multiple-photos`
Verify multiple photos for task submission.

#### `POST /extract-metadata`
Extract EXIF metadata from uploaded photo.

#### `GET /health`
Check service health status.

### Node.js Server (Port 3001)

#### `POST /api/verify-photo`
Node.js wrapper for photo verification.

#### `POST /api/verify-multiple-photos`
Node.js wrapper for multiple photo verification.

#### `POST /api/extract-metadata`
Node.js wrapper for metadata extraction.

#### `GET /api/verification-health`
Check verification service health.

## Usage Examples

### Frontend Integration

```tsx
import PhotoCapture from '@/components/PhotoCapture';

function TaskSubmission() {
  const handlePhotosVerified = (photos: File[], results: any[]) => {
    console.log('Photos verified:', photos);
    console.log('Verification results:', results);
  };

  return (
    <PhotoCapture
      onPhotosVerified={handlePhotosVerified}
      taskType="tree_planting"
      taskLocation={{ lat: 40.7128, lng: -74.0060 }}
      taskDeadline={{
        start: new Date().toISOString(),
        end: new Date(Date.now() + 86400000).toISOString()
      }}
      userId="CIV123456"
      maxPhotos={5}
    />
  );
}
```

### Direct API Usage

```javascript
const formData = new FormData();
formData.append('photo', photoFile);
formData.append('taskType', 'tree_planting');
formData.append('locationLat', '40.7128');
formData.append('locationLng', '-74.0060');
formData.append('deadlineStart', '2024-01-01T00:00:00Z');
formData.append('deadlineEnd', '2024-01-02T00:00:00Z');
formData.append('userId', 'CIV123456');

const response = await fetch('/api/verify-photo', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Verification Process

### 1. **Photo Upload/Capture**
- User captures photo via camera or uploads from device
- Photos are validated for format and size

### 2. **EXIF Extraction**
- Extract timestamp, GPS coordinates, camera settings
- Validate metadata completeness and consistency

### 3. **Location Verification**
- Compare photo GPS with task location
- Check if within acceptable radius (default: 100m)

### 4. **Timestamp Verification**
- Verify photo was taken within task deadline
- Check if photo is recent (within 24 hours)

### 5. **AI Authenticity Checks**
- Run perceptual hashing for duplicates
- Analyze for manipulation artifacts
- Detect AI-generated content
- Face detection and analysis

### 6. **Context Verification**
- Analyze image content for task requirements
- Object detection based on task type
- Background and environment analysis

### 7. **Watermarking**
- Add user ID and timestamp watermark
- Store watermarked version

### 8. **Scoring & Decision**
- Calculate overall verification score (0-100)
- Determine approval/rejection based on threshold (70+)
- Generate recommendations for improvement

## Configuration

### Task Types and Requirements

```python
# Example task requirements
task_requirements = TaskRequirements(
    task_type="tree_planting",
    required_objects=["tree", "shovel", "person"],
    location_coordinates=(40.7128, -74.0060),
    location_radius_meters=100,
    deadline_start=datetime.now() - timedelta(days=1),
    deadline_end=datetime.now() + timedelta(days=1),
    requires_video=False
)
```

### Verification Thresholds

```python
# In PhotoVerificationService
def _calculate_verification_score(self, timestamp_valid, location_valid, context_valid, ai_results):
    score = 0
    
    if timestamp_valid: score += 25
    if location_valid: score += 25
    if context_valid: score += 20
    
    # AI check scores
    manipulation_score = ai_results.get("manipulation_score", 0)
    if manipulation_score < 30: score += 20
    elif manipulation_score < 50: score += 10
    
    # Face detection bonus
    if ai_results.get("face_detected"): score += 10
    
    return min(score, 100)
```

## Troubleshooting

### Common Issues

#### Python Service Won't Start
- Check Python version (3.8+ required)
- Verify all dependencies are installed
- Check port 8000 is available

#### Camera Access Denied
- Ensure HTTPS in production (required for camera access)
- Check browser permissions
- Test on mobile device

#### Verification Fails
- Check Python service is running
- Verify environment variables
- Check network connectivity between services

#### EXIF Data Missing
- Ensure camera metadata is enabled
- Check location services are on
- Verify photo format supports EXIF

### Debug Mode

Enable debug logging in Python service:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance Considerations

### Optimization Tips
- Use image compression for large photos
- Implement caching for repeated verifications
- Batch process multiple photos
- Use async processing for AI checks

### Scaling
- Deploy Python service on multiple instances
- Use Redis for caching
- Implement queue system for high-volume processing
- Consider cloud-based AI services for heavy workloads

## Security Features

- File type validation
- Size limits (10MB max)
- User authentication required
- Rate limiting on API endpoints
- Secure file handling and cleanup
- Watermarking for traceability

## Future Enhancements

- [ ] Video verification support
- [ ] Advanced AI model integration
- [ ] Real-time verification dashboard
- [ ] Mobile app integration
- [ ] Blockchain verification records
- [ ] Multi-language support
- [ ] Advanced fraud detection
- [ ] Integration with government databases

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check service logs
4. Verify configuration settings
5. Test with sample images

## License

This project is part of the Civitas platform. See main project license for details.
