# Frontend-Backend Integration Guide

Complete guide on how the React UI connects to the FastAPI backend.

---

## 🔗 Integration Points

### 1. Authentication Flow

#### Frontend Flow:
```
User fills registration form
    ↓
POST /auth/register (API)
    ↓
Backend creates user & returns token
    ↓
Frontend stores token in localStorage
    ↓
Frontend sets Authorization header
    ↓
Redirects to Dashboard
```

#### Code Example:
```typescript
// src/hooks/useAuth.ts
const register = async (userData: any) => {
  const response = await apiClient.register(userData);
  localStorage.setItem('accessToken', response.data.access_token);
  setUser(response.data.user);
  navigate('/');
};
```

#### API Integration:
```typescript
// src/services/api.ts
async register(userData) {
  return this.client.post('/auth/register', userData);
}
```

---

### 2. Dashboard Data Loading

#### Frontend Display:
```
User navigates to Dashboard
    ↓
useEffect triggers
    ↓
GET /dashboard/summary (API)
    ↓
Backend queries database for user data
    ↓
Returns: today's stats, progress, goals
    ↓
Frontend displays in cards
```

#### Connected Components:
- **Greeting Card**: Displays user name from `user.name`
- **Daily Stats**: Shows calories, workouts, water, steps
- **Progress Percentage**: Calculated from completed tasks
- **Weekly Chart**: Uses recharts with API data

#### Backend Response:
```json
{
  "user": {"name": "Priya", "weight": 65},
  "today": {"calories_consumed": 1500, "steps": 7500},
  "progress": {"workouts_percentage": 50},
  "stats": {"streak_days": 7}
}
```

---

### 3. Workout Plan Generation

#### Frontend Flow:
```
User clicks "Generate Workout Plan"
    ↓
Fills: Goal, Fitness Level, Workout Type, Time
    ↓
POST /workouts/generate-plan
    ↓
Backend:
  - Gets user health profile
  - Calls Groq LLM with prompt
  - Saves plan to database
  - Returns 7-day plan
    ↓
Frontend displays formatted plan
```

#### Component Integration:
```typescript
// src/app/pages/WorkoutPlan.tsx
const handleGeneratePlan = async () => {
  const response = await apiClient.generateWorkoutPlan({
    goal: selectedGoal,
    fitness_level: user.fitness_level,
    workout_type: selectedType,
    time_available: timeAvailable
  });
  
  setPlan(response.data.plan);
};
```

#### Backend Processing:
```python
# app/services/workout_generator.py
plan_data = groq_client.generate_json_response(prompt)  # AI generates
plan_json = json.dumps(plan_data)
workout_plan = WorkoutPlan(user_id=user.id, plan_json=plan_json)
db.add(workout_plan)
db.commit()
```

#### Displayed in UI:
```
Day 1 - Monday
├── Warmup: 5 minutes jumping jacks
├── Exercises:
│   ├── Push-ups (3x10)
│   ├── Squats (3x12)
│  └── Plank (30 sec)
├── Cooldown: Stretching
└── Tip: Focus on form
```

---

### 4. Meal Plan Generation

#### Flow:
```
User navigates to Meal Plan
    ↓
POST /meals/generate-plan
  - Diet Type: vegetarian/non_veg/vegan/keto
  - Calories: 1500-2500
  - Allergies: from health profile
    ↓
Groq generates 7-day meal plan
    ↓
Displays breakfast/lunch/dinner/snacks
    ↓
User marks meals as complete
```

#### API Integration:
```typescript
const handleGenerateMealPlan = async () => {
  const response = await apiClient.generateMealPlan({
    diet_type: profile.diet_type,
    calories: selectedCalories
  });
};
```

#### Data Stored in Database:
```
meal_plans table:
├── id
├── user_id
├── plan_json (7-day meals)
├── calories (goal)
└── diet_type
```

---

### 5. Checklist Completion Tracking

#### Workout Checklist:
```
User sees exercise list
    ↓
☐ Jumping Jacks
☐ Push-ups
☐ Squats
☐ Plank
    ↓
User clicks checkbox
    ↓
POST /workouts/complete-exercise
  {
    "exercise": "Push-ups",
    "day": 1,
    "completed": true
  }
    ↓
Backend updates workout_progress table
    ↓
Calculates: 1/4 = 25% completion
    ↓
Frontend updates UI dynamically
```

#### Component Code:
```typescript
const handleCheckboxChange = async (exercise: string) => {
  await apiClient.completeExercise({
    exercise,
    day: 1,
    completed: !workoutProgress[exercise]
  });
  
  // Update local state
  setWorkoutProgress(prev => ({
    ...prev,
    [exercise]: !prev[exercise]
  }));
};
```

#### Real-time Updates:
- Completion percentage updates immediately
- Progress rings animate
- Data persisted to database
- Survives page refresh

---

### 6. AROMI AI Chat Integration

#### Chat Flow:
```
User types message in AICoach page
    ↓
Message: "I am traveling"
    ↓
POST /aromi/chat
    ↓
Backend:
  - Gets user context (profile, plans)
  - Detects constraint type: "travelling"
  - Gets quick suggestions
  - OR calls Groq for full response
    ↓
Returns AI response
    ↓
Frontend displays in chat bubble
    ↓
User can request plan adjustment
    ↓
POST /workouts/adjust-plan
    ↓
New plan generated & saved
```

#### Message Handling:
```typescript
// src/app/pages/AICoach.tsx
const handleSendMessage = async (text: string) => {
  const response = await apiClient.sendAromicMessage(text);
  
  const aiMessage: Message = {
    id: Date.now().toString(),
    role: "assistant",
    content: response.data.response,
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, aiMessage]);
};
```

#### Backend Chat Processing:
```python
# app/services/aromi_chat.py
def chat(user_id, message, db):
    user_context = get_user_context(user_id, db)
    
    # Check for adjustment request
    adjustment = detect_adjustment_request(message)
    
    if adjustment:
        # Return quick suggestions
        return get_adjustment_suggestions(adjustment["type"])
    else:
        # Call Groq LLM with context
        response = groq_client.generate_response(
            system_prompt=AROMI_SYSTEM_PROMPT + user_context,
            prompt=message
        )
        return response
```

---

### 7. Progress Page Integration

#### Data Flow:
```
User navigates to Progress page
    ↓
GET /dashboard/weekly-stats
    ↓
Backend returns 7 days of:
  - Calories consumed
  - Calories burned
  - Weight trend
    ↓
Frontend renders using Recharts:
  - Line Chart: Weight trend
  - Bar Chart: Calories
    ↓
Shows analytics
```

#### Chart Data Format:
```json
[
  {
    "day": "Mon",
    "calories_consumed": 1950,
    "calories_burned": 420,
    "weight": 65.0
  },
  ...
]
```

#### Component:
```typescript
<LineChart data={weeklyData}>
  <XAxis dataKey="day" />
  <YAxis />
  <Line type="monotone" dataKey="weight" stroke="#8b5cf6" />
</LineChart>
```

---

### 8. Health Profile Setup

#### Flow:
```
User completes registration
    ↓
Navigates to Settings/Health Profile
    ↓
Fills health information:
  - Allergies
  - Medical conditions
  - Diet type
  - Available time
  - Workout preference
    ↓
POST /users/health-profile
    ↓
Backend stores in database
    ↓
Used for plan generation
```

#### API Call:
```typescript
const handleSaveHealth Profile = async () => {
  await apiClient.createHealthProfile({
    allergies: "Peanuts",
    medical_conditions: "Asthma",
    diet_type: "vegetarian",
    daily_time_available: 60,
    workout_preference: "home"
  });
};
```

#### Database Schema:
```
health_profiles:
├── id
├── user_id
├── allergies (used by meal plan)
├── medical_conditions
├── diet_type (used by meal plan)
├── daily_time_available (used by workout)
└── workout_preference (used by workout)
```

---

### 9. User Profile Updates

#### Flow:
```
User changes profile info:
  - Age, Weight, Height
  - Fitness Level
  - Goal

    ↓
PUT /users/me
    ↓
Backend updates users table
    ↓
Frontend updates local state
    ↓
Changes reflected everywhere
```

#### Component:
```typescript
const handleUpdateProfile = async (updates) => {
  const response = await apiClient.updateUser(updates);
  setUser(response.data);
};
```

---

### 10. Data Persistence

#### Authentication:
```typescript
// Token stored in localStorage
localStorage.setItem('accessToken', token);

// Sent with every request
config.headers.Authorization = `Bearer ${token}`;

// Validated on backend
def get_current_user(token: str):
    decoded = decode_token(token)
    user = db.query(User).filter(User.id == decoded['sub']).first()
```

#### Database:
```
All user data persists in PostgreSQL:
- User accounts
- Health profiles
- Generated plans
- Progress logs
- Meal/workout completion records

Multi-user isolation:
Each query filters by user_id
SELECT * FROM workout_plans WHERE user_id = 1
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  (Vite, TypeScript, Tailwind, Radix UI)                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Axios HTTP Requests
                     │ Authorization: Bearer {token}
                     │
┌────────────────────▼─────────────────────────────────────┐
│                   FastAPI Backend                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Routes: auth, users, workouts, meals, aromi, etc   │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                               │
│  ┌────────────────────▼──────────────────────────────┐│
│  │ Services:                                        ││
│  │ WorkoutGeneratorService                          ││
│  │ MealGeneratorService                             ││
│  │ AromichatService                                 ││
│  │ PlanAdjusterService                              ││
│  └────────────────────┬──────────────────────────────┘│
│                       │                               │
│  ┌────────────────────▼──────────────────────┬───────┐│
│  │  Groq LLM                                 │       ││
│  │  (Workout/Meal/Chat Generation)           │       ││
│  │                       ╱───────────────────┘       ││
│  └─────────────────────────────────────────────────┘│
│                       │                               │
┌────────────────────────▼─────────────────────────────────┐
│              PostgreSQL Database                        │
│  ┌────────────────────────────────────────────────────┐
│  │ Tables:                                            │
│  │ - users (accounts)                                │
│  │ - health_profiles                                 │
│  │ - workout_plans                                   │
│  │ - meal_plans                                      │
│  │ - workout_progress (checklist)                    │
│  │ - meal_progress (checklist)                       │
│  │ - progress_logs (daily tracking)                  │
│  └────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Integration

### Token Flow:
```
1. User registers/logs in
2. Backend creates JWT token
3. Frontend stores in localStorage
4. Sent as: Authorization: Bearer {token}
5. Backend validates with secret key
6. Request proceeds if valid
7. If invalid: 401 Unauthorized → logout
```

### Request Interceptor:
```typescript
this.client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor:
```typescript
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }
);
```

---

## 🎯 Connected Features

| Feature | Frontend | Backend API | Database |
|---------|----------|-------------|----------|
| Authentication | /login page | /auth/register, /auth/login | users |
| Dashboard | Dashboard.tsx | /dashboard/summary | progress_logs |
| Workout Plan | WorkoutPlan.tsx | /workouts/generate-plan | workout_plans |
| Meal Plan | MealPlan.tsx | /meals/generate-plan | meal_plans |
| Workout Checklist | Dashboard.tsx | /workouts/complete-exercise | workout_progress |
| Meal Checklist | Dashboard.tsx | /meals/complete-meal | meal_progress |
| AROMI Chat | AICoach.tsx | /aromi/chat | (session-based) |
| Progress Stats | Progress.tsx | /dashboard/weekly-stats | progress_logs |
| User Profile | Settings.tsx | /users/me, /users/health-profile | users, health_profiles |

---

## ✅ Testing Integrations

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123","age":25,"gender":"M","height":180,"weight":75}'

# Receive token, use it
```

### 2. Test Workout Generation
```bash
curl -X POST http://localhost:8000/workouts/generate-plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goal":"weight_loss","fitness_level":"beginner","workout_type":"cardio","time_available":30}'
```

### 3. Test in Frontend
- Open http://localhost:5173
- Register new account
- Check browser console for API calls
- Verify data appears on Dashboard

---

## 🐛 Integration Debugging

### Check Network Requests:
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. See request/response

### Check localStorage:
```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.removeItem('accessToken')
```

### Backend Logs:
```bash
# Watch backend server output for errors
# Look for traceback if request fails
```

### Database Verification:
```sql
-- Connect to database
psql -U arogyauser -d arogyamitra

-- Check user created
SELECT * FROM users;

-- Check workout plan
SELECT * FROM workout_plans;
```

---

**Integration is complete and production-ready! 🚀**
