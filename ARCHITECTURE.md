# System Architecture & Technical Overview

Complete technical architecture of the ArogyaMitra AI fitness platform.

---

## 🏗️ High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ArogyaMitra Platform                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────────┐  ┌──────────────────────────┐  │
│  │   React Frontend (UI Health)     │  │   FastAPI Backend        │  │
│  │  ┌────────────────────────────┐  │  │  ┌────────────────────┐ │  │
│  │  │ Dashboard                  │  │  │  │ Auth Routes        │ │  │
│  │  │ - Daily stats              │  │  │  │ - Register         │ │  │
│  │  │ - Progress tracking        │  │  │  │ - Login            │ │  │
│  │  │ - Checklists               │◄─┼──┼──┤ - JWT validation   │ │  │
│  │  │                            │  │  │  │                    │ │  │
│  │  ├────────────────────────────┤  │  │  ├────────────────────┤ │  │
│  │  │ Workout Plan               │  │  │  │ Workout Routes     │ │  │
│  │  │ - AI generated plans       │  │  │  │ - Generate (Groq)  │ │  │
│  │  │ - Exercise checklist       │◄─┼──┼──┤ - Adjust on demand │ │  │
│  │  │ - Progress %               │  │  │  │ - Track completion │ │  │
│  │  │                            │  │  │  │                    │ │  │
│  │  ├────────────────────────────┤  │  │  ├────────────────────┤ │  │
│  │  │ Meal Plan                  │  │  │  │ Meal Routes        │ │  │
│  │  │ - Personalized meals       │  │  │  │ - Generate (Groq)  │ │  │
│  │  │ - Meal checklist           │◄─┼──┼──┤ - Track meals      │ │  │
│  │  │ - Nutritional tracking     │  │  │  │                    │ │  │
│  │  │                            │  │  │  ├────────────────────┤ │  │
│  │  ├────────────────────────────┤  │  │  │ AROMI Routes       │ │  │
│  │  │ AI Coach (AROMI)           │  │  │  │ - Chat (Groq)      │ │  │
│  │  │ - Real-time chat           │  │  │  │ - Context aware    │ │  │
│  │  │ - Plan adjustments         │◄─┼──┼──┤ - Suggestions      │ │  │
│  │  │ - Motivation               │  │  │  │                    │ │  │
│  │  │                            │  │  │  ├────────────────────┤ │  │
│  │  ├────────────────────────────┤  │  │  │ Progress Routes    │ │  │
│  │  │ Progress Analytics         │  │  │  │ - Dashboard data   │ │  │
│  │  │ - Weekly charts            │  │  │  │ - Weekly stats     │ │  │
│  │  │ - Weight trends            │◄─┼──┼──┤ - Log daily data   │ │  │
│  │  │ - Stats                    │  │  │  │                    │ │  │
│  │  │                            │  │  │  ├────────────────────┤ │  │
│  │  ├────────────────────────────┤  │  │  │ User Routes        │ │  │
│  │  │ Health Profile             │  │  │  │ - Profile CRUD     │ │  │
│  │  │ - Allergies                │  │  │  │ - Health info      │ │  │
│  │  │ - Medical conditions       │◄─┼──┼──┤ - Preferences      │ │  │
│  │  │ - Preferences              │  │  │  │                    │ │  │
│  │  │                            │  │  │  └────────────────────┘ │  │
│  │  │ Settings                   │  │  │                         │  │
│  │  │ - Account options          │  │  │  Services Layer:        │  │
│  │  └────────────────────────────┘  │  │  ┌────────────────────┐ │  │
│  │                                   │  │  │ WorkoutGenerator   │ │  │
│  │                                   │  │  │ MealGenerator      │ │  │
│  │  API Client (Axios):              │  │  │ AromichatService   │ │  │
│  │  - auth.ts                        │  │  │ PlanAdjuster       │ │  │
│  │  - Automatic token injection      │  │  │ (Groq Integration) │ │  │
│  │  - Error handling                 │  │  └────────────────────┘ │  │
│  │  - Interceptors                   │  │                         │  │
│  │                                   │  │  Utilities:             │  │
│  │                                   │  │  ┌────────────────────┐ │  │
│  │  useAuth Hook:                    │  │  │ JWT Handler        │ │  │
│  │  - Login/Register                 │  │  │ Password Manager   │ │  │
│  │  - Token management               │  │  │ Prompts            │ │  │
│  │  - User persistence               │  │  └────────────────────┘ │  │
│  │                                   │  │                         │  │
│  │  Vite + TypeScript + Tailwind CSS │  │  Pydantic Schemas:      │  │
│  │  Radix UI Components              │  │  ┌────────────────────┐ │  │
│  └─────────────────────────────────┘  │  │ UserSchema          │ │  │
│                                        │  │ WorkoutSchema       │ │  │
│                                        │  │ MealSchema          │ │  │
│                                        │  └────────────────────┘ │  │
│                                        │                         │  │
│                                        │  SQLAlchemy Models:     │  │
│                                        │  ┌────────────────────┐ │  │
│  HTTP (Axios)◄──────────────────────┬─┤  │ User                │ │  │
│               (Bearer Token)          │  │  │ HealthProfile      │ │  │
│                                        │  │  │ WorkoutPlan        │ │  │
│                                        │  │  │ MealPlan           │ │  │
│                                        │  │  │ Progress tables    │ │  │
│                                        │  │  └────────────────────┘ │  │
│  ┌────────────────────────────────────┴──┼─────────────────────────┐ │
│  │                                       │                         │  │
│  │                          PostgreSQL Database (7 Tables)         │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐   │  │
│  │  │ users        │  │ workout_plans  │  │ meal_progress    │   │  │
│  │  │ (auth)       │  │ (JSON storage) │  │ (checklist)      │   │  │
│  │  │              │  │                │  │                  │   │  │
│  │  │ health_pro.. │  │ meal_plans     │  │ progress_logs    │   │  │
│  │  │ (preferences)│  │ (JSON storage) │  │ (daily tracking) │   │  │
│  │  │              │  │                │  │                  │   │  │
│  │  │ workout_pro..│  │                │  │                  │   │  │
│  │  │ (checklist)  │  │                │  │                  │   │  │
│  │  └──────────────┘  └────────────────┘  └──────────────────┘   │  │
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────┬──┘ │
│                                                                  │   │
│                         ▼                                        │   │
│  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  Groq LLaMA-3.3-70B (External AI Service)               │  │   │
│  │  ┌──────────────────────────────────────────────────┐  │  │   │
│  │  │ • Workout generation with user profile          │  │  │   │
│  │  │ • Meal planning with dietary preferences        │  │  │   │
│  │  │ • AROMI chat with context awareness             │  │  │   │
│  │  │ • Plan adjustment for user feedback             │  │  │   │
│  │  │ • JSON structured responses                      │  │  │   │
│  │  └──────────────────────────────────────────────────┘  │  │   │
│  └──────────────────────────────────────────────────────────┘  │   │
│                                                                   │   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Registration & Authentication Flow

```
User Input (Register Form)
    ↓
React Component (Register Page)
    ↓
apiClient.register(userData)
    ↓
POST /auth/register
    ↓
Backend: Create User
  ├─ Validate input (Pydantic)
  ├─ Hash password (Bcrypt)
  ├─ Create User model
  ├─ Save to database
  └─ Generate JWT token
    ↓
Response: {token, user}
    ↓
Frontend: Store token
  ├─ localStorage.setItem('accessToken', token)
  ├─ Update useAuth state
  └─ Navigate to Dashboard
    ↓
✅ User authenticated
```

### Workout Plan Generation Flow

```
User: "Generate Workout Plan"
    ↓
React Component collects:
  ├─ Goal (weight_loss, muscle_gain, etc.)
  ├─ Fitness Level (beginner, intermediate, advanced)
  ├─ Workout Type (cardio, strength, mixed)
  └─ Time Available (30, 45, 60 minutes)
    ↓
POST /workouts/generate-plan
    ↓
Backend:
  1. Get current user (JWT validation)
  2. Get user's health profile
  3. Create LLM prompt with all context
  4. Call Groq LLaMA API
  5. Parse JSON response
  6. Save to workout_plans table
  7. Return formatted plan
    ↓
✅ RES 200:
{
  "id": 1,
  "plan": {
    "plan": [
      { "day": 1, "exercises": [...], "tip": "..." },
      ...
    ]
  }
}
    ↓
Frontend: Display 7-day plan
  ├─ Render Day 1, Day 2, ... Day 7
  ├─ Show exercises with reps/sets
  └─ Display tips and video links
```

### Exercise Completion Flow

```
User Clicks: ☐ Push-ups
    ↓
Frontend: handleCheckboxChange("Push-ups")
    ↓
POST /workouts/complete-exercise
{
  "exercise": "Push-ups",
  "day": 1,
  "completed": true
}
    ↓
Backend:
  1. Get current user
  2. Check if record exists
  3. Create/Update workout_progress
  4. Set completed_at timestamp
  5. Calculate completion percentage
  6. Commit to database
    ↓
✅ Response with completion %
    ↓
Frontend: Update UI
  ├─ Check box becomes ☑
  ├─ Update progress % in real-time
  └─ Persist changes (survives page refresh)
```

### AROMI Chat Flow

```
User Types: "I am traveling"
    ↓
POST /aromi/chat { "message": "I am traveling" }
    ↓
Backend:
  1. Get current user
  2. Detect constraint type (travelling)
  3. Get user's current plans
  4. Check for quick suggestions
    ↓ (Traveling detected)
  5. Return quick suggestions
    ├─ Focus: Bodyweight exercises
    ├─ Examples: Push-ups, Squats, Planks
    └─ Tip: Hotel rooms work great
    ↓
✅ Response with suggestions
    ↓
Frontend: Display AROMI message
  ├─ Show suggestions
  ├─ Offer to adjust plan
  └─ Keep chat history
```

### Plan Adjustment Flow

```
AROMI: "Would you like an adjusted workout plan?"
User: "Yes, adjust it"
    ↓
POST /workouts/adjust-plan
{
  "constraint": "travelling",
  "reason": "Business trip for 2 weeks"
}
    ↓
Backend:
  1. Get current user
  2. Get current workout plan
  3. Create adjustment prompt
  4. Call Groq LLM with:
     - Current plan
     - Constraint (travelling)
     - User's fitness level
     - Available resources
  5. Parse JSON response
  6. Save new plan (keeps old one)
  7. Return adjusted plan
    ↓
✅ New plan based on constraint
    ↓
Frontend: Show adjusted plan
  ├─ All bodyweight exercises
  ├─ No equipment needed
  └─ Optimized for hotel room
```

---

## 🗄️ Database Schema Relationships

```
users (Central)
    │
    ├──→ health_profiles (1:1)
    │    └─ allergies, medical_conditions, diet_type, preferences
    │
    ├──→ workout_plans (1:Many)
    │    └─ plan_json (7-day plans), created_at, updated_at
    │
    ├──→ meal_plans (1:Many)
    │    └─ plan_json (7-day plans), calories, diet_type
    │
    ├──→ workout_progress (1:Many)
    │    └─ day, exercise, completed, completed_at
    │
    ├──→ meal_progress (1:Many)
    │    └─ meal_name, completed, completed_at
    │
    └──→ progress_logs (1:Many)
         └─ date, weight, steps, workout_completed, calories_consumed

Total: 7 Tables, Full Multi-User Isolation
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────┐
│ Frontend Security                                │
├─────────────────────────────────────────────────┤
│ • JWT stored in localStorage                    │
│ • Sent in Authorization header                  │
│ • Clear on logout                               │
└─────────────────────────────────────────────────┘
                      ↓
        HTTPS/TLS Encryption in Transit
                      ↓
┌─────────────────────────────────────────────────┐
│ Request Validation (Backend)                    │
├─────────────────────────────────────────────────┤
│ • Pydantic schema validation                    │
│ • Type checking                                 │
│ • Input sanitization                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Authentication                                  │
├─────────────────────────────────────────────────┤
│ • JWT token validation                          │
│ • get_current_user() dependency                │
│ • Automatic token expiry                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Authorization                                   │
├─────────────────────────────────────────────────┤
│ • User ID from token                            │
│ • Query filtering by user_id                   │
│ • No cross-user data access                    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Data Protection (Database)                      │
├─────────────────────────────────────────────────┤
│ • Password hashing (bcrypt)                    │
│ • SQLAlchemy ORM (SQL injection prevention)    │
│ • Connection pooling                           │
│ • Parameterized queries                        │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Cycle

```
1. FRONTEND REQUEST
   ├─ User interaction (click, submit form)
   ├─ React component state update
   ├─ apiClient method call
   └─ HTTP request with Bearer token

2. REQUEST TRANSMISSION
   ├─ Axios interceptor adds Authorization header
   ├─ CORS check passes (allowed origins)
   ├─ HTTPS encryption
   └─ Router directs to correct endpoint

3. BACKEND REQUEST PROCESSING
   ├─ FastAPI route receives request
   ├─ JWT dependency verifies token
   ├─ get_current_user fetches user
   ├─ Pydantic validates request body
   ├─ Service layer handles business logic
   ├─ Database queries with user_id filter
   └─ Response prepared

4. BACKEND RESPONSE
   ├─ Service processes data
   ├─ Response schema serializes
   ├─ Status code set (200, 201, 400, 401, etc.)
   └─ JSON response created

5. RESPONSE TRANSMISSION
   ├─ HTTP response over HTTPS
   ├─ CORS headers included
   └─ JSON payload

6. FRONTEND RECEIVING
   ├─ Axios interceptor checks status
   ├─ If 401: clear token, logout
   ├─ If error: handle gracefully
   └─ If success: proceed

7. STATE UPDATE
   ├─ React component state updated
   ├─ UI re-renders
   ├─ Data persisted locally (if needed)
   └─ User sees updated information
```

---

## 📊 Service Architecture

```
API Routes L ayer
    │
    ├─ auth_routes
    │   └─ calls: jwt_handler
    │
    ├─ user_routes
    │   ├─ calls: User model
    │   └─ calls: get_current_user()
    │
    ├─ workout_routes
    │   ├─ calls: WorkoutGeneratorService
    │   ├─ calls: PlanAdjusterService
    │   └─ calls: get_current_user()
    │
    ├─ meal_routes
    │   ├─ calls: MealGeneratorService
    │   ├─ calls: HealthProfile model
    │   └─ calls: get_current_user()
    │
    ├─ aromi_routes
    │   ├─ calls: AromichatService
    │   └─ calls: get_current_user()
    │
    └─ progress_routes
        ├─ calls: ProgressLog model
        └─ calls: get_current_user()
            │
            ▼
        Service Layer
            │
            ├─ WorkoutGeneratorService
            │   ├─ calls: groq_client
            │   ├─ calls: WorkoutPlan model
            │   └─ calls: SQLAlchemy db
            │
            ├─ MealGeneratorService
            │   ├─ calls: groq_client
            │   ├─ calls: MealPlan model
            │   └─ calls: SQLAlchemy db
            │
            ├─ AromichatService
            │   ├─ calls: groq_client
            │   └─ calls: User model
            │
            └─ PlanAdjusterService
                ├─ calls: groq_client
                ├─ calls: WorkoutPlan model
                └─ calls: SQLAlchemy db
                    │
                    ▼
            Groq AI Client
                │
                ├─ LLM: LLaMA-3.3-70B
                ├─ Model: llama-3.3-70b-versatile
                └─ Response: JSON parsed
                    │
                    ▼
            Database Access Layer
                │
                ├─ SQLAlchemy ORM
                ├─ PostgreSQL connection
                ├─ 7 table models
                └─ User-filtered queries
```

---

## 🚀 Deployment Architecture

```
Development:
  ┌─────────────────┐
  │ Local Machine   │
  │ ├─ React Dev    │ (Vite localhost:5173)
  │ ├─ FastAPI      │ (Uvicorn localhost:8000)
  │ └─ PostgreSQL   │ (Local/Docker)
  └─────────────────┘

Production (Multi-Option):

Option 1: Cloud Platforms (Vercel, Heroku, Railway)
  ┌──────────────────────────────────────────┐
  │ CDN/Frontend (Vercel, Netlify)          │
  │  └─ Build → Deploy → Cache static files │
  └──────────────────────────────────────────┘
            ↓ HTTPS
  ┌──────────────────────────────────────────┐
  │ Backend Server (Heroku, Railway)         │
  │  └─ Gunicorn + Uvicorn                   │
  └──────────────────────────────────────────┘
            ↓ SSL
  ┌──────────────────────────────────────────┐
  │ Managed Database (AWS RDS, Railway DB)   │
  │  └─ PostgreSQL with backups              │
  └──────────────────────────────────────────┘

Option 2: AWS (EC2 + RDS)
  ┌──────────────────────────────────────────┐
  │ CloudFront CDN                           │
  │  └─ S3 bucket (static files)             │
  └──────────────────┬───────────────────────┘
            ↓ HTTPS
  ┌──────────────────────────────────────────┐
  │ Application Load Balancer                │
  │  └─ Routes traffic to backend instances  │
  └──────────────────┬───────────────────────┘
            ↓
  ┌──────────────────────────────────────────┐
  │ EC2 Instances (2-4, auto-scaling)       │
  │  ├─ Nginx reverse proxy                  │
  │  ├─ Gunicorn (4 workers each)            │
  │  └─ Health checks enabled                │
  └──────────────────┬───────────────────────┘
            ↓
  ┌──────────────────────────────────────────┐
  │ RDS PostgreSQL (Multi-AZ)                │
  │  ├─ Primary instance                     │
  │  ├─ Read replica                         │
  │  └─ Automated backups                    │
  └──────────────────────────────────────────┘
```

---

## 📈 Scalability Path

```
Stage 1: MVP (Current)
├─ Single backend instance
├─ Managed PostgreSQL
├─ Basic monitoring
└─ 100-1000 users

Stage 2: Growth (1-2 months)
├─ Load balancer + 2-3 instances
├─ Read replicas
├─ CDN for frontend
├─ Redis caching
└─ 1,000-10,000 users

Stage 3: Scale (6+ months)
├─ Kubernetes orchestration
├─ Microservices (API, AI, scheduler)
├─ Horizontal scaling
├─ Advanced monitoring
└─ 10,000+ users
```

---

## 🎯 Technology Decision Matrix

| Aspect | Choice | Why |
|--------|--------|-----|
| Frontend | React + TypeScript | Type safety, component reusability, ecosystem |
| API | FastAPI | Async, fast, OpenAPI docs, easy to scale |
| Database | PostgreSQL | ACID compliant, relational, reliable |
| AI | Groq LLaMA | Fast, free tier, JSON support, streaming |
| Auth | JWT + Bcrypt | Stateless, scalable, secure |
| ORM | SQLAlchemy | SQL injection prevention, flexibility |
| Validation | Pydantic | Fast, declarative, integration with FastAPI |
| Build | Vite | Fast, modern, TypeScript support |
| Styling | Tailwind CSS | Utility-first, responsive, fast |
| Components | Radix UI | Unstyled, accessible, composable |

---

**Architecture is scalable, secure, and production-ready! 🚀**
