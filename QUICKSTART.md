# Quick Start Guide - ArogyaMitra

Get the entire application running in 5 minutes!

---

## ⚡ Quick Setup

### Step 1: Set up Backend (Terminal 1)

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

**Create `.env` file:**
```
DATABASE_URL=postgresql://username:password@localhost:5432/arogyamitra
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=super-secret-key-change-this
API_PORT=8000
DEBUG=True
```

**Start backend:**
```bash
uvicorn app.main:app --reload
```

### Step 2: Setup Frontend (Terminal 2)

```bash
cd "UI Health"
npm install
npm run dev
```

### Step 3: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🗄️ Database Setup (One Time)

### Using PostgreSQL CLI:

```bash
# Connect to PostgreSQL
psql -U postgres

# Run these commands:
CREATE DATABASE arogyamitra;
CREATE USER arogyauser WITH PASSWORD 'password123';
ALTER ROLE arogyauser SET client_encoding TO 'utf8';
ALTER ROLE arogyauser SET default_transaction_isolation TO 'read committed';
ALTER ROLE arogyauser SET default_transaction_deferrable TO on;
ALTER ROLE arogyauser SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE arogyamitra TO arogyauser;

\q
```

---

## 🧪 Test the System

### 1. Register User (in Frontend)
- Go to http://localhost:5173
- Click Register
- Fill form with sample data

### 2. Generate Workout Plan
- After login, go to Dashboard
- Click "Generate Workout Plan"
- Select options and generate

### 3. Test AROMI Chat
- Go to AI Coach page
- Type "I am traveling"
- Get plan adjustment suggestions

---

## 📦 Dependencies Installed

### Backend (requirements.txt):
- FastAPI - API framework
- FastAPI-CORS - Cross-origin requests
- SQLAlchemy - Database ORM  
- Psycopg2 - PostgreSQL adapter
- Pydantic - Data validation
- Python-Jose - JWT tokens
- Passlib - Password hashing
- Groq - AI LLM client
- Python-dotenv - Environment variables

### Frontend (package.json):
- React - UI framework
- React Router - Routing
- Tailwind CSS - Styling
- Radix UI - Components
- Axios - HTTP client
- Vite - Build tool

---

## 🔑 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 8000 | http://localhost:8000 |
| Database | 5432 | localhost:5432 |

---

## 🆘 Common Issues

### Issue: "psycopg2.OperationalError: could not connect to server"
**Solution:**
```bash
# Make sure PostgreSQL is running
# Windows: Check Services (postgresql-x64-xx)
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/arogyamitra
```

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:**
```bash
# Make sure venv is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### Issue: "GROQ_API_KEY" not set
**Solution:**
1. Go to https://console.groq.com
2. Sign up/login
3. Create API key
4. Add to `.env`: `GROQ_API_KEY=gsk_xxxxx`

### Issue: Frontend not connecting to backend
**Solution:**
- Check `.env.local` in UI Health folder:
```
VITE_API_URL=http://localhost:8000
```
- Ensure backend is running on port 8000
- Check CORS in backend/app/config.py

---

## 📊 Features to Test

✅ **Register/Login** - Test authentication
✅ **Health Profile** - Set fitness preferences
✅ **Generate Workout** - Create 7-day plan with AI
✅ **Generate Meals** - Create meal plan with AI
✅ **AROMI Chat** - Talk to AI coach
✅ **Checklists** - Mark workouts/meals as done
✅ **Dashboard** - See progress & stats
✅ **Plan Adjustment** - "I'm traveling" → adjusted plan

---

## 🚀 Next Steps

1. Start both backend and frontend
2. Register an account
3. Explore the dashboard
4. Generate your first AI workout plan
5. Chat with AROMI coach
6. Track your progress

**Everything is ready to use!** 🎉

---

For detailed setup, see `README_SETUP.md`
