# Civitas - Quick Start Guide

## 🚀 One-Command Startup

### Windows (Recommended)
```bash
start.bat
```
or
```bash
run-civitas.bat
```

### PowerShell
```powershell
.\run-civitas.ps1
```

## 📋 What the startup script does:

1. **Checks system requirements** (Python 3.8+, Node.js 16+)
2. **Installs Node.js dependencies** (`npm install`)
3. **Sets up Python virtual environment** (if not exists)
4. **Installs Python dependencies** (from `requirements.txt`)
5. **Starts all services**:
   - Python Photo Verification Service (port 8000)
   - Node.js API Server (port 3001)
   - Frontend Development Server (port 8080)

## 🌐 Access Points

After running the startup script, you can access:

- **Frontend Application**: http://localhost:8080
- **API Server**: http://localhost:3001
- **Photo Verification Service**: http://localhost:8000

## 🔧 Manual Commands (if needed)

### Start Python Service Only
```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python photo_verification_api.py
```

### Start Node.js Server Only
```bash
npm run dev:server
```

### Start Frontend Only
```bash
npm run dev
```

### Install Dependencies Only
```bash
# Node.js dependencies
npm install

# Python dependencies
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 🧪 Test Services

Run this to test if all services are working:
```bash
test-services.bat
```

## 🛠️ Troubleshooting

### If Python service fails:
- Check if Python 3.8+ is installed
- Verify virtual environment is created
- Check if all Python dependencies are installed

### If Node.js service fails:
- Check if Node.js 16+ is installed
- Verify npm dependencies are installed
- Check if port 3001 is available

### If frontend fails:
- Check if port 8080 is available
- Verify all Node.js dependencies are installed

### If photo verification fails:
- Check if Python service is running on port 8000
- Verify photo format (JPG, PNG)
- Check browser console for errors

## 📁 Project Structure

```
Civitas/
├── client/                 # React frontend
├── server/                 # Node.js + Python backend
│   ├── venv/              # Python virtual environment
│   ├── photo_verification.py
│   └── photo_verification_api.py
├── run-civitas.bat        # Main startup script
├── start.bat              # Quick start
└── test-services.bat      # Test script
```

## ✅ Success Indicators

- Python service responds to http://localhost:8000/health
- Node.js service responds to http://localhost:3001/api/demo
- Frontend loads at http://localhost:8080
- Photo verification works without errors

## 🎯 Next Steps

1. Run `start.bat` or `run-civitas.bat`
2. Wait for all services to start (check terminal windows)
3. Open http://localhost:8080 in your browser
4. Test the photo verification functionality
5. Check the terminal windows for any error messages

That's it! Your Civitas project should now be running completely.
