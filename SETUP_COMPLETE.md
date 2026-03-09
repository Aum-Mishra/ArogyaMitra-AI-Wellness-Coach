# Complete Setup Guide - Connect Everything

## ✅ What I Fixed

1. **Created Login page** (`Login.tsx`) - Shows login form
2. **Created Register page** (`Register.tsx`) - Creates new accounts  
3. **Created Protected Routes** - Redirects to login if not authenticated
4. **Updated RootLayout** - Shows actual user data, added logout button
5. **Updated Routes** - Login/Register pages now accessible, protected routes work

---

## 🚀 Step-by-Step Setup

### **STEP 1: Start PostgreSQL**

**Windows:**
- Open Services (`services.msc`)
- Find `postgresql-x64-xx` 
- Right-click → Start
- OR run in PowerShell:
```powershell
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

**Test connection:**
```powershell
psql -U postgres
\q
```

---

### **STEP 2: Create Database**

```powershell
psql -U postgres

# Copy & paste all of these:
CREATE DATABASE arogyamitra;
CREATE USER arogyauser WITH PASSWORD 'password123';
ALTER ROLE arogyauser SET client_encoding TO 'utf8';
ALTER ROLE arogyauser SET default_transaction_isolation TO 'read committed';
ALTER ROLE arogyauser SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE arogyamitra TO arogyauser;

# Exit
\q
```

---

### **STEP 3: Backend Setup - IMPORTANT**

**Get Groq API Key (2 minutes):**
```
1. Go to https://console.groq.com
2. Click "Sign Up" or "Sign In"
3. Click "Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with gsk_)
```

**Create `.env` file in backend folder:**

```powershell
# Navigate to backend
cd backend

# Create .env file with your actual values:
# Windows - Create blank file:
New-Item .env -type file
# Then open it and add:
```

**Add this to `.env`:**
```
DATABASE_URL=postgresql://arogyauser:password123@localhost:5432/arogyamitra
GROQ_API_KEY=gsk_your_actual_key_here
SECRET_KEY=your_random_secret_key_here
API_PORT=8000
DEBUG=True
```

**Generate SECRET_KEY (pick ONE method):**

Option 1 - PowerShell:
```powershell
-join ((1..32) | ForEach-Object { [char]((33..126) | Get-Random) })
# Copy output to .env
```

Option 2 - Online: https://randomkeygen.com/ (copy "Fort Knox Passwords")

---

### **STEP 4: Install Backend Dependencies**

```powershell
cd backend

# Activate venv
python -m venv venv
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

---

### **STEP 5: Start Backend (Terminal 1)**

```powershell
# Make sure you're in backend folder with venv activated
cd backend
venv\Scripts\activate

# Start server
uvicorn app.main:app --reload
```

✅ **Look for:**
```
Uvicorn running on http://127.0.0.1:8000
```

---

### **STEP 6: Start Frontend (Terminal 2)**

```powershell
# In a NEW terminal
cd "UI Health"

# Dev server already has node_modules, just run:
npm run dev
```

✅ **Look for:**
```
VITE v... ready in ... ms
➜  Local: http://localhost:5173/
```

---

## 🎯 NOW TEST THE FLOW

### **Go to http://localhost:5173/**

You should see:
1. **Login page** (not dashboard!)
2. Option to "Sign up"

### **Click "Sign up"**
- Fill all fields
- Click Create Account
- ✅ Should redirect to Dashboard

### **Or Click "Sign in"**
- Use the account you just created
- ✅ You see Dashboard with your name

### **Test Features**
1. Go to **Workout Plan** → Generate (calls Groq LLaMA)
2. Go to **Meal Plan** → Generate (calls Groq LLaMA)
3. Go to **AI Coach** → Chat with AROMI
4. Go to **Health Profile** → Edit your info
5. **Click profile avatar** → See logout option

---

## ✅ Verify Everything is Connected

| Service | URL | Expected |
|---------|-----|----------|
| **Frontend** | http://localhost:5173 | Login page shows |
| **Backend** | http://localhost:8000 | API running message |
| **API Docs** | http://localhost:8000/docs | Interactive API docs |
| **Database** | localhost:5432 | psql connects |

---

## 🆘 If Frontend Still Doesn't Show Login

**Check these:**

1. **Backend running?**
   ```powershell
   # In Terminal 1 (backend)
   # Should show: "Uvicorn running on http://127.0.0.1:8000"
   ```

2. **Frontend has .env.local?**
   ```
   UI Health/.env.local should have:
   VITE_API_URL=http://localhost:8000
   ```

3. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear All
   - Reload http://localhost:5173

4. **Restart frontend:**
   ```powershell
   # Terminal 2
   Ctrl+C (stop dev server)
   npm run dev
   ```

---

## 🔐 First-Time User Journey

1. **Register**: Fill age, gender, height, weight, fitness level, goal
2. **Login**: Email + password  
3. **Dashboard**: Shows welcome with your info
4. **Health Profile**: Add allergies, diet type, workout preferences (if needed)
5. **Generate Workout**: Click button → Groq creates 7-day plan → Shows on dashboard
6. **Generate Meals**: Click button → Groq creates meal plan → Shows on dashboard
7. **Chat with AROMI**: Ask questions or request plan adjustments

---

## 🎬 Everything Should Now Work!

The **ENTIRE system is connected:**
- ✅ Frontend shows Login
- ✅ Registration creates users in SQL
- ✅ Login with JWT tokens
- ✅ Backend connected to Groq AI
- ✅ Plans stored in database
- ✅ Dashboard shows real data

Start following the setup steps above!
