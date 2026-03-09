# ArogyaMitra - AI Fitness & Wellness Platform

A **complete production-ready full-stack AI fitness platform** with React frontend, FastAPI backend, PostgreSQL database, and Groq LLaMA-3.3-70B integration.

---

## 🚀 Features

✅ **AI-Powered Workouts** - LLema generates personalized 7-day workout plans
✅ **AI Nutrition Planning** - Custom meal plans aligned with diet preferences
✅ **AROMI AI Coach** - Intelligent fitness assistant with plan adjustment
✅ **User Authentication** - Secure JWT-based auth with bcrypt passwords
✅ **Progress Tracking** - Real-time workout/meal checklist completion
✅ **Multi-User Support** - Each user has separate data, plans, and history
✅ **Dashboard Analytics** - Weekly stats, progress percentage, motivational tracking
✅ **Plan Adjustment Engine** - Automatically adjusts plans for travel, injury, fatigue
✅ **Frontend Integration** - React UI connected to backend APIs

---

## 📁 Project Structure

```
arogyamitra/
├── backend/
│   ├── app/
│   │   ├── main.py (entry point)
│   │   ├── config.py (settings)
│   │   ├── database.py (SQLAlchemy setup)
│   │   ├── models/ (database models)
│   │   ├── schemas/ (Pydantic schemas)
│   │   ├── routes/ (FastAPI routes)
│   │   ├── services/ (business logic)
│   │   ├── utils/ (helpers & JWT)
│   │   └── ai/ (Groq LLM integration)
│   ├── requirements.txt (Python dependencies)
│   ├── .env.example (environment template)
│   └── .env (local environment)
│
└── UI Health/ (existing React project)
    ├── src/
    │   ├── services/
    │   │   └── api.ts (API client)
    │   ├── hooks/
    │   │   └── useAuth.ts (auth hook)
    │   ├── pages/ (Dashboard, WorkoutPlan, MealPlan, etc.)
    │   └── main.tsx
    ├── .env.local (API URL config)
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1️⃣ **Backend Setup**

#### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Groq API Key (get from https://console.groq.com)

#### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup PostgreSQL Database**
   ```bash
   # Create database
   createdb arogyamitra
   
   # Or using SQL:
   # CREATE DATABASE arogyamitra;
   ```

5. **Configure environment**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and set:
     - `DATABASE_URL` = `postgresql://username:password@localhost:5432/arogyamitra`
     - `GROQ_API_KEY` = your actual Groq API key
     - `SECRET_KEY` = generate a secure key

6. **Create database tables**
   - Tables are automatically created when you start the server

7. **Start backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Backend will run at: **http://localhost:8000**
   API Documentation: **http://localhost:8000/docs**

---

### 2️⃣ **Frontend Setup**

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation Steps

1. **Navigate to UI Health directory**
   ```bash
   cd "UI Health"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   - Edit `.env.local` and ensure:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run at: **http://localhost:5173**

---

## 🔐 Database Setup

### PostgreSQL Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Initialize database
initdb -D "C:\Program Files\PostgreSQL\data"
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE arogyamitra;
CREATE USER arogyauser WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE arogyamitra TO arogyauser;

\q  # Exit psql
```

---

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/verify` - Verify token

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile
- `POST /users/health-profile` - Create health profile
- `GET /users/health-profile` - Get health profile

### Workouts
- `POST /workouts/generate-plan` - Generate 7-day plan
- `GET /workouts/my-plan` - Get current plan
- `POST /workouts/complete-exercise` - Mark exercise done
- `GET /workouts/progress` - Get progress stats
- `POST /workouts/adjust-plan` - Adjust plan for constraints

### Meals
- `POST /meals/generate-plan` - Generate 7-day meal plan
- `GET /meals/my-plan` - Get current plan
- `POST /meals/complete-meal` - Mark meal done
- `GET /meals/progress` - Get progress stats

### AROMI Chat
- `POST /aromi/chat` - Send message to AI coach
- `GET /aromi/suggestions` - Get quick suggestions

### Dashboard
- `GET /dashboard/summary` - Get dashboard data
- `GET /dashboard/weekly-stats` - Get weekly statistics
- `POST /dashboard/log-progress` - Log daily progress

---

## 🧠 AI Integration

### Groq LLaMA-3.3-70B Setup

1. **Get API Key:**
   - Visit https://console.groq.com
   - Sign up/Login
   - Create API key
   - Copy and add to `.env` file

2. **LLM Capabilities:**
   - Generates workout plans from user profile
   - Creates personalized meal plans
   - Acts as AROMI fitness coach
   - Adjusts plans based on constraints

3. **Prompts Used:**
   - Workout generation with fitness level considerations
   - Meal planning with dietary restrictions
   - Plan adjustment for travel/injury/fatigue
   - Real-time coaching with context awareness

---

## 📊 Database Schema

### Users Table
```sql
users (
  id, name, email, password_hash, age, gender,
  height, weight, fitness_level, goal, created_at
)
```

### Health Profile
```sql
health_profiles (
  id, user_id, allergies, medical_conditions,
  diet_type, daily_time_available, workout_preference
)
```

### Workout Plans
```sql
workout_plans (
  id, user_id, plan_json, created_at, updated_at
)
```

### Meal Plans
```sql
meal_plans (
  id, user_id, plan_json, calories, diet_type, created_at
)
```

### Progress Tracking
```sql
workout_progress (id, user_id, day, exercise, completed, completed_at)
meal_progress (id, user_id, meal_name, completed, completed_at)
progress_logs (id, user_id, date, weight, steps, calories_consumed, water_intake)
```

---

## 🔐 Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - Bcrypt password hashing
✅ **CORS Protection** - Restricted origins
✅ **Pydantic Validation** - Input data validation
✅ **SQL Injection Prevention** - SQLAlchemy ORM protection
✅ **Environment Variables** - Sensitive data protection

---

## 📱 Frontend Features Connected to Backend

### Dashboard
- Fetches user data from `/users/me`
- Loads daily progress from `/dashboard/summary`
- Displays workout/meal checklists
- Shows completion percentages

### Workout Plan
- Generates plan via `/workouts/generate-plan`
- Displays 7-day plan from `/workouts/my-plan`
- Marks exercises done via `/workouts/complete-exercise`
- Shows progress via `/workouts/progress`

### Meal Plan
- Generates plan via `/meals/generate-plan`
- Gets current plan from `/meals/my-plan`
- Updates meal completion via `/meals/complete-meal`
- Tracks meal progress

### AI Coach (AROMI)
- Sends messages to `/aromi/chat`
- Receives intelligent responses
- Detects adjustment requests
- Can generate adjusted plans on demand

### Progress Page
- Fetches weekly stats from `/dashboard/weekly-stats`
- Logs daily progress via `/dashboard/log-progress`
- Displays trends and analytics

---

## 🚀 Running the Application

### Terminal 1 - Start Database
```bash
# Ensure PostgreSQL is running
# macOS: brew services start postgresql
# Windows: services → PostgreSQL
# Linux: sudo systemctl start postgresql
```

### Terminal 2 - Start Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

### Terminal 3 - Start Frontend
```bash
cd "UI Health"
npm run dev
```

### Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ✅ Testing the System

### 1. Test Authentication
```bash
# Register new user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya",
    "email": "priya@example.com",
    "password": "password123",
    "age": 28,
    "gender": "F",
    "height": 165,
    "weight": 65,
    "fitness_level": "beginner",
    "goal": "weight_loss"
  }'
```

### 2. Test Workout Generation
```bash
curl -X POST "http://localhost:8000/workouts/generate-plan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "weight_loss",
    "fitness_level": "beginner",
    "workout_type": "cardio",
    "time_available": 30
  }'
```

### 3. Test AI Chat
```bash
curl -X POST "http://localhost:8000/aromi/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I am traveling, can you adjust my workout plan?"}'
```

---

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError"**
```bash
# Ensure venv is activated and packages installed
pip install -r requirements.txt
```

**Database connection error**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Ensure database exists
```

**Groq API error**
```bash
# Verify GROQ_API_KEY in .env
# Check API key is valid at https://console.groq.com
```

### Frontend Issues

**API not responding**
```bash
# Check VITE_API_URL in .env.local
# Ensure backend is running on port 8000
# Check CORS settings in backend/app/config.py
```

**Login fails**
```bash
# Ensure user created via backend
# Check token storage in localStorage
# Clear localStorage and try again
```

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/arogyamitra
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
SECRET_KEY=your-secret-key-here
API_PORT=8000
DEBUG=True
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

---

## 🔄 API Response Examples

### Workout Plan Response
```json
{
  "id": 1,
  "user_id": 1,
  "plan": {
    "plan": [
      {
        "day": 1,
        "date": "Monday",
        "warmup": "5 minutes jumping jacks",
        "exercises": [
          {"name": "Push-ups", "sets": 3, "reps": 10, "rest": "60 seconds"}
        ],
        "cooldown": "5 minutes stretching",
        "tip": "Focus on form"
      }
    ]
  },
  "created_at": "2024-03-08T10:00:00"
}
```

### AROMI Response
```json
{
  "response": "Great question! Based on your travel situation, I recommend these bodyweight exercises: Push-ups, Squats, Planks...",
  "user_id": 1,
  "timestamp": "2024-03-08T12:00:00"
}
```

---

## 📚 Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, React Router
- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL
- **AI:** Groq LLaMA-3.3-70B
- **Authentication:** JWT + Bcrypt
- **API Client:** Axios
- **UI Components:** Radix UI

---

## 🎯 Next Steps

1. ✅ Start both backend and frontend
2. ✅ Register a new account
3. ✅ Complete health profile
4. ✅ Generate a workout plan
5. ✅ Generate a meal plan
6. ✅ Test AROMI chat
7. ✅ Track progress with checklists
8. ✅ View dashboard analytics

---

## 📄 License

All rights reserved.

---

## 👨‍💻 Support

For issues or questions, check:
- Backend API Docs: http://localhost:8000/docs
- Frontend Components: src/ folder
- Database Schema: models/ folder

---

**Ready to revolutionize fitness with AI! 🚀**
