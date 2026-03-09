# 🏋️ Smart Bridge - AI Fitness & Wellness Coach Platform

## Overview
Smart Bridge is an intelligent health and fitness platform powered by AI. It provides personalized meal plans, workout routines, and an AI coach (AROMI) that adapts to user fitness goals.

**Project Type**: Semester 2 Smart Bridge Assignment  
**Status**: ✅ Complete & Production Ready

---

## 🎯 Key Features

### 1. **Personalized Meal Plans**
- 7-day meal plans based on diet type and calorie goals
- Daily macro tracking (protein, carbs, fats, calories)
- Allergy considerations
- AI-powered meal generation using Groq LLM

### 2. **Custom Workout Plans**
- 7-day workout programs tailored to fitness level
- Exercise progression and rest periods
- Warmup/cooldown recommendations
- YouTube video integration for form guidance

### 3. **AROMI AI Coach**
- Real-time fitness advice and motivation
- Plan adjustment suggestions
- Conversation history persistence
- Context-aware recommendations

### 4. **Health Achievement Tracking**
- Progress visualization with charts
- Daily completion tracking
- Milestone achievements
- Historical data analysis

### 5. **User Authentication**
- JWT-based authentication
- Secure password hashing
- Session management
- Role-based access control

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM (PostgreSQL/SQLite)
- **AI/LLM**: Groq Cloud API (Mixtral-8x7b model)
- **Auth**: JWT tokens with secure handling

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (lightning-fast bundling)
- **Styling**: Tailwind CSS + Custom theme
- **HTTP Client**: Axios
- **UI Components**: Shadcn/ui

### DevOps
- **Version Control**: Git + GitHub
- **Package Management**: npm, pip
- **Runtime**: Node.js, Python 3.8+

---

## 📋 Project Structure

```
Smart Bridge/
├── backend/
│   ├── app/
│   │   ├── ai/              # LLM integration (Groq)
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── schemas/         # Request/response schemas
│   │   ├── utils/           # Helpers & prompts
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # DB connection
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Virtual environment
│
├── UI Health/              # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable React components
│   │   │   ├── pages/      # Page components
│   │   │   └── routes.tsx  # Route definitions
│   │   ├── services/       # API client
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # CSS & themes
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── node_modules/
│
├── Documentation/
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── ...
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Groq API Key (get from https://console.groq.com)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create .env file with:
# GROQ_API_KEY=your_api_key_here
# DATABASE_URL=sqlite:///./database.db

# Run server
python -m uvicorn app.main:app --reload
```

Server runs at: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd "UI Health"

# Install dependencies
npm install

# Set environment variables
# Create .env file with:
# VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

App runs at: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `GET /auth/me` - Get current user profile

### Health Profile
- `GET /health/profile` - Get user's health profile
- `POST /health/profile` - Create/update health profile

### Meal Plans
- `POST /meals/generate-plan` - Generate personalized meal plan
- `GET /meals/my-plan` - Get user's current meal plan
- `POST /meals/complete-meal` - Mark meal as completed

### Workout Plans
- `POST /workouts/generate-plan` - Generate personalized workout plan
- `GET /workouts/my-plan` - Get user's current workout plan
- `POST /workouts/complete-exercise` - Mark exercise as completed

### AROMI AI Coach
- `POST /aromi/chat` - Send message to AI coach
- `GET /aromi/chat-history` - Get previous conversations
- `POST /aromi/adjust-plan` - Request plan adjustments from AI

### Progress Tracking
- `GET /progress/overview` - Get overall progress stats
- `GET /progress/daily` - Get daily progress summary

Full API documentation available at `/docs` endpoint (Swagger UI)

---

## 🔑 Key Features Implemented

✅ **Data Persistence**: All user data saved to database with proper relationships  
✅ **AI Integration**: Groq LLM generates realistic, personalized plans  
✅ **Real-time Updates**: Frontend instantly reflects generated plans  
✅ **Error Handling**: Comprehensive error messages and logging  
✅ **Security**: JWT authentication, password hashing, CORS protection  
✅ **Responsive Design**: Mobile-friendly UI with Tailwind CSS  
✅ **User Experience**: Smooth transitions, loading states, error boundaries  
✅ **Accessibility**: ARIA labels, keyboard navigation support  

---

## 🐛 Known Issues & Fixes

### Issue 1: Plan Generation Delays
- **Status**: ✅ Fixed
- **Solution**: Added loading states and timeout warnings

### Issue 2: Plan Display Not Showing
- **Status**: ✅ Fixed
- **Solution**: Fixed data structure mapping between LLM output and frontend expectations

### Issue 3: Settings Data Persistence
- **Status**: ✅ Fixed
- **Solution**: Implemented proper database persistence with verification reload

---

## 📊 Testing

### Database Verification
```bash
# Check if meal plans exist
sqlite3 database.db "SELECT id, user_id, calories, created_at FROM meal_plans LIMIT 5;"

# Check if workout plans exist
sqlite3 database.db "SELECT id, user_id, created_at FROM workout_plans LIMIT 5;"
```

### API Testing
```bash
# Test backend with curl
curl -X GET http://localhost:8000/health

# Test with Swagger UI
Open: http://localhost:8000/docs
```

### Frontend Testing
View browser console (F12) for detailed logs with `[MealPlan]`, `[WorkoutPlan]` prefixes

---

## 🔐 Security Best Practices

- JWT tokens stored in localStorage (consider httpOnly for production)
- Passwords hashed with bcrypt
- CORS enabled only for trusted origins
- Environment variables for sensitive data
- SQL injection prevention via ORM
- CSRF protection ready for deployment

---

## 📝 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Detailed endpoint reference
- **[Architecture](ARCHITECTURE.md)** - System design and data flow
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment steps
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Third-party integrations
- **[Testing Guide](TESTING_GUIDE.md)** - Test procedures

---

## 🤝 Contributing

This is a submission project. For questions or feedback:
1. Create an issue describing the problem
2. Fork and create a feature branch
3. Submit a pull request with clear description

---

## 📄 License

This project is part of Sem 2 Smart Bridge Assignment. All rights reserved.

---

## 👨‍💻 Author

[Your Name]  
Company: [Your Company]  
Submission Date: March 2026

---

## 📞 Support

For deployment or integration support:
- Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
- Review [API Documentation](API_DOCUMENTATION.md)
- Check the [Troubleshooting Guide](TESTING_GUIDE.md)

---

## ✨ Recent Fixes (Latest Session)

- ✅ Fixed plan display issue (data structure mapping)
- ✅ Added comprehensive error logging
- ✅ Improved error messages for better debugging
- ✅ Enhanced frontend data transformation
- ✅ Fixed async/await in API calls
- ✅ Added detailed console logging prefixes

**Last Updated**: March 9, 2026
