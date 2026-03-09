# API Documentation - ArogyaMitra

Complete reference for all API endpoints with request/response examples.

---

## 🔗 Base URL
```
http://localhost:8000
```

---

## 🔐 Authentication

All endpoints (except `/auth/register`, `/auth/login`) require:

```
Authorization: Bearer {access_token}
```

---

## 📚 API Endpoints

### 🔑 **Authentication** (`/auth`)

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "secure_password_123",
  "age": 28,
  "gender": "Female",
  "height": 165,
  "weight": 65,
  "fitness_level": "beginner",
  "goal": "weight_loss"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "age": 28,
    "gender": "Female",
    "height": 165,
    "weight": 65,
    "fitness_level": "beginner",
    "goal": "weight_loss",
    "created_at": "2024-03-08T10:00:00"
  }
}
```

#### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "priya@example.com",
  "password": "secure_password_123"
}

Response 200: (Same as register)
```

#### Verify Token
```http
GET /auth/verify?token=eyJhbGciOiJIUzI1NiIs...

Response 200:
{ "valid": true }
```

---

### 👤 **Users** (`/users`)

#### Get Current User
```http
GET /users/me
Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "age": 28,
  "gender": "Female",
  "height": 165,
  "weight": 65,
  "fitness_level": "beginner",
  "goal": "weight_loss",
  "created_at": "2024-03-08T10:00:00"
}
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "age": 29,
  "weight": 63,
  "fitness_level": "intermediate",
  "goal": "muscle_gain"
}

Response 200: (Updated user data)
```

#### Create Health Profile
```http
POST /users/health-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "allergies": "Peanuts, Shellfish",
  "medical_conditions": "None",
  "diet_type": "vegetarian",
  "daily_time_available": 60,
  "workout_preference": "home"
}

Response 200:
{
  "id": 1,
  "user_id": 1,
  "allergies": "Peanuts, Shellfish",
  "medical_conditions": "None",
  "diet_type": "vegetarian",
  "daily_time_available": 60,
  "workout_preference": "home"
}
```

#### Get Health Profile
```http
GET /users/health-profile
Authorization: Bearer {token}

Response 200: (Health profile data)
```

---

### 💪 **Workouts** (`/workouts`)

#### Generate Workout Plan
```http
POST /workouts/generate-plan
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal": "weight_loss",
  "fitness_level": "beginner",
  "workout_type": "cardio",
  "time_available": 30
}

Response 200:
{
  "id": 1,
  "user_id": 1,
  "plan": {
    "plan": [
      {
        "day": 1,
        "date": "Monday",
        "warmup": "5 minutes jumping jacks and arm circles",
        "exercises": [
          {
            "name": "Running",
            "duration": "20 minutes",
            "intensity": "moderate"
          },
          {
            "name": "Cool down walk",
            "duration": "5 minutes",
            "intensity": "low"
          }
        ],
        "cooldown": "Stretching",
        "tip": "Stay hydrated",
        "youtube_link": "https://youtube.com/..."
      },
      ...
    ]
  },
  "created_at": "2024-03-08T10:00:00"
}
```

#### Get Current Workout Plan
```http
GET /workouts/my-plan
Authorization: Bearer {token}

Response 200: (Workout plan data from database)
```

#### Mark Exercise Complete
```http
POST /workouts/complete-exercise
Authorization: Bearer {token}
Content-Type: application/json

{
  "exercise": "Push-ups",
  "day": 1,
  "completed": true
}

Response 200:
{
  "id": 1,
  "exercise": "Push-ups",
  "completed": true,
  "completion_percentage": 25.0
}
```

#### Get Workout Progress
```http
GET /workouts/progress
Authorization: Bearer {token}

Response 200:
{
  "total_exercises": 4,
  "completed_exercises": 1,
  "completion_percentage": 25.0,
  "records": [
    {
      "id": 1,
      "day": 1,
      "exercise": "Push-ups",
      "completed": true,
      "completed_at": "2024-03-08T11:00:00"
    }
  ]
}
```

#### Adjust Workout Plan
```http
POST /workouts/adjust-plan
Authorization: Bearer {token}
Content-Type: application/json

{
  "constraint": "travelling",
  "reason": "On business trip in New York"
}

Response 200:
{
  "id": 2,
  "adjustment_reason": "travelling: On business trip",
  "plan": { ... },
  "created_at": "2024-03-08T11:30:00"
}
```

#### Get Adjustment Suggestions
```http
GET /workouts/adjustment-suggestions/travelling

Response 200:
{
  "focus": "Bodyweight exercises",
  "examples": ["Push-ups", "Bodyweight squats", "Plank", "Burpees"],
  "duration": "20-30 minutes",
  "tip": "Hotel rooms are perfect for these workouts!"
}
```

---

### 🍽️ **Meals** (`/meals`)

#### Generate Meal Plan
```http
POST /meals/generate-plan
Authorization: Bearer {token}
Content-Type: application/json

{
  "diet_type": "vegetarian",
  "calories": 2000,
  "number_of_days": 7
}

Response 200:
{
  "id": 1,
  "user_id": 1,
  "plan": {
    "plan": [
      {
        "day": 1,
        "date": "Monday",
        "breakfast": {
          "name": "Oatmeal with berries",
          "calories": 350,
          "protein": 10,
          "carbs": 55,
          "fat": 8
        },
        "lunch": {
          "name": "Chickpea rice bowl",
          "calories": 520,
          "protein": 15,
          "carbs": 70,
          "fat": 10
        },
        "dinner": {
          "name": "Dal with roti",
          "calories": 450,
          "protein": 15,
          "carbs": 70,
          "fat": 8
        },
        "snacks": {
          "name": "Greek yogurt with nuts",
          "calories": 200,
          "protein": 15,
          "carbs": 15,
          "fat": 8
        }
      }
    ]
  },
  "calories": 2000,
  "diet_type": "vegetarian",
  "created_at": "2024-03-08T10:00:00"
}
```

#### Get Current Meal Plan
```http
GET /meals/my-plan
Authorization: Bearer {token}

Response 200: (Meal plan data)
```

#### Mark Meal Complete
```http
POST /meals/complete-meal
Authorization: Bearer {token}
Content-Type: application/json

{
  "meal_name": "Breakfast",
  "completed": true
}

Response 200:
{
  "id": 1,
  "meal_name": "Breakfast",
  "completed": true,
  "completion_percentage": 25.0
}
```

#### Get Meal Progress
```http
GET /meals/progress
Authorization: Bearer {token}

Response 200:
{
  "total_meals": 4,
  "completed_meals": 1,
  "completion_percentage": 25.0,
  "records": [
    {
      "id": 1,
      "meal_name": "Breakfast",
      "completed": true,
      "completed_at": "2024-03-08T08:00:00"
    }
  ]
}
```

---

### 🤖 **AROMI Chat** (`/aromi`)

#### Send Message to AROMI
```http
POST /aromi/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "I am traveling. Can you adjust my workout plan?"
}

Response 200:
{
  "response": "I've detected that you need workout adjustments for: travelling\n\nHere are some quick suggestions:\n- Focus: Bodyweight exercises\n- Examples: Push-ups, Bodyweight squats, Plank, Burpees\n- Suggested Duration: 20-30 minutes\n- Tip: Hotel rooms are perfect for these workouts!\n\nWould you like me to generate an adjusted workout plan for you?",
  "user_id": 1,
  "timestamp": "2024-03-08T12:00:00"
}
```

#### Get AROMI Suggestions
```http
GET /aromi/suggestions
Authorization: Bearer {token}

Response 200:
{
  "suggestions": [
    {
      "icon": "Dumbbell",
      "label": "Adjust workout plan",
      "color": "primary"
    },
    {
      "icon": "UtensilsCrossed",
      "label": "Suggest healthy meal",
      "color": "accent"
    },
    {
      "icon": "Heart",
      "label": "Recovery exercises",
      "color": "destructive"
    },
    {
      "icon": "TrendingUp",
      "label": "Track my progress",
      "color": "secondary"
    }
  ]
}
```

---

### 📊 **Dashboard** (`/dashboard`)

#### Get Dashboard Summary
```http
GET /dashboard/summary
Authorization: Bearer {token}

Response 200:
{
  "user": {
    "name": "Priya Sharma",
    "weight": 65,
    "goal": "weight_loss"
  },
  "today": {
    "calories_consumed": 1500,
    "calories_goal": 2000,
    "water_intake": 2400,
    "steps": 7500,
    "workout_completed": true
  },
  "progress": {
    "workouts_completed": 1,
    "workouts_total": 4,
    "workouts_percentage": 25.0,
    "meals_completed": 2,
    "meals_total": 4,
    "meals_percentage": 50.0
  },
  "stats": {
    "weekly_workouts": 4,
    "weekly_meals": 20,
    "streak_days": 7,
    "total_progress": 87.5
  }
}
```

#### Get Weekly Statistics
```http
GET /dashboard/weekly-stats
Authorization: Bearer {token}

Response 200:
{
  "weekly_stats": [
    {
      "day": "Mon",
      "calories_consumed": 1950,
      "calories_burned": 420,
      "weight": 65.0
    },
    {
      "day": "Tue",
      "calories_consumed": 1800,
      "calories_burned": 430,
      "weight": 64.9
    },
    ...
  ]
}
```

#### Log Progress
```http
POST /dashboard/log-progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "weight": 64.5,
  "steps": 8000,
  "calories_consumed": 1850,
  "water_intake": 2500,
  "workout_completed": true
}

Response 200:
{
  "status": "logged",
  "date": "2024-03-08",
  "data": {
    "weight": 64.5,
    "steps": 8000,
    "calories_consumed": 1850,
    "water_intake": 2500
  }
}
```

---

## 📋 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Backend issue |

---

## 🧪 Testing with cURL

### Example: Generate Workout Plan

```bash
curl -X POST "http://localhost:8000/workouts/generate-plan" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "weight_loss",
    "fitness_level": "beginner",
    "workout_type": "cardio",
    "time_available": 30
  }'
```

### Example: Send AROMI Message

```bash
curl -X POST "http://localhost:8000/aromi/chat" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I am tired today, suggest recovery workouts"}'
```

---

## 🔄 Data Flow

```
Client Request
    ↓
FastAPI Route
    ↓
Authentication Check (JWT)
    ↓
Pydantic Schema Validation
    ↓
Service Layer (Business Logic)
    ↓
AI (Groq LLM) / Database Query
    ↓
Response Schema
    ↓
JSON Response to Client
```

---

## 🎯 API Usage in Frontend

```typescript
import apiClient from './services/api';

// Register
const response = await apiClient.register({
  name: 'Priya',
  email: 'priya@example.com',
  password: 'password123',
  age: 28,
  gender: 'F',
  height: 165,
  weight: 65
});

// Generate Workout
const workout = await apiClient.generateWorkoutPlan({
  goal: 'weight_loss',
  fitness_level: 'beginner',
  workout_type: 'cardio',
  time_available: 30
});

// Chat with AROMI
const response = await apiClient.sendAromicMessage('I am traveling');
```

---

**API is ready for production use! 🚀**
