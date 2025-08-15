# 🔧 Manual Fix Guide - Adobe Hackathon Application

## 🚨 **Issues Identified & Solutions**

### **Issue 1: Backend Not Starting**
**Problem**: Backend process not running on port 8080
**Solution**: 
1. Navigate to Backend directory: `cd Backend`
2. Run: `.\mvnw.cmd spring-boot:run`
3. Wait for "Started AdobeChallenge1bApplication" message

### **Issue 2: Frontend API Configuration**
**Problem**: API base URL set to `0.0.0.0:8080` instead of `localhost:8080`
**Solution**: 
1. Open `Frontend/lib/api.ts`
2. Change line 3: `'http://0.0.0.0:8080'` → `'http://localhost:8080'`

### **Issue 3: Health Endpoint Not Found**
**Problem**: Frontend can't connect to backend health endpoint
**Solution**: 
1. Ensure backend is running first
2. Test: `curl http://localhost:8080/api/frontend/config`
3. If config works, health endpoint should work too

## 🚀 **Quick Fix Commands**

### **Option 1: Use the Fix Script**
```powershell
.\fix-all-issues.ps1
```

### **Option 2: Manual Steps**

**Step 1: Stop all processes**
```powershell
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Step 2: Start Backend**
```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

**Step 3: Start Frontend (in new terminal)**
```powershell
cd Frontend
npm run dev
```

**Step 4: Test**
- Backend: http://localhost:8080/actuator/health
- Frontend: http://localhost:3000
- API: http://localhost:8080/api/frontend/config

## ✅ **Expected Results**

After fixing:
- ✅ Backend shows "Available" in Settings page
- ✅ PDF upload works
- ✅ Adobe PDF Embed API displays documents
- ✅ Related sections show with >80% accuracy
- ✅ Insights generation works
- ✅ Podcast mode works

## 🔍 **Troubleshooting**

**If backend still doesn't start:**
1. Check Java version: `java -version`
2. Check Maven: `.\mvnw.cmd -version`
3. Clean and rebuild: `.\mvnw.cmd clean compile`

**If frontend still shows "Backend unavailable":**
1. Check if backend is running: `netstat -ano | Select-String ":8080"`
2. Test API directly: `curl http://localhost:8080/api/frontend/config`
3. Check browser console for CORS errors

**If ports are in use:**
1. Find process: `netstat -ano | Select-String ":8080|:3000"`
2. Kill process: `Stop-Process -Id <PID> -Force`

