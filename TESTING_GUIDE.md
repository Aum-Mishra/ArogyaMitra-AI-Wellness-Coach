# Smart Bridge - Complete Testing Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL running
- Terminal access

## Step 1: Start Backend Server

```powershell
# Open PowerShell and navigate to backend folder
cd "d:\Work\SY Work\Sem 2\Smart Bridge\backend"

# Activate virtual environment (if using venv)
# py -m venv venv
# .\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Step 2: Start Frontend Dev Server

```powershell
# Open new PowerShell window
cd "d:\Work\SY Work\Sem 2\Smart Bridge\UI Health"

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Expected output:
```
  VITE v5.0.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Step 3: Test Complete User Flow

### Test Case 1: Register New User
1. Open browser: `http://localhost:5173`
2. Click "Create an account" on login page
3. Fill in registration form:
   - **Name:** Test User 1
   - **Email:** testuser1@example.com
   - **Password:** Test123456
   - **Age:** 25
   - **Gender:** Male/Female (your choice)
   - **Height:** 175 cm
   - **Weight:** 70 kg
   - **Fitness Level:** Intermediate
   - **Goal:** Weight Loss
4. Click "Sign Up"
5. **Expected:** Redirected to health profile setup page

### Test Case 2: Complete Health Profile Setup
1. You should see "Health Profile Setup" page
2. Fill in health profile:
   - **Diet Type:** Vegetarian
   - **Allergies:** None / Dairy (your choice)
   - **Medical Conditions:** None
   - **Daily Time Available:** 45 minutes
   - **Workout Preference:** Strength Training
3. Click "Create Profile"
4. **Expected:** 
   - Loading spinner appears
   - Backend generates LLM plans
   - Redirected to dashboard
   - Dashboard shows your name (not "Priya")

### Test Case 3: Verify Dashboard Shows Real Data
1. On Dashboard page:
2. **Verify:**
   - [ ] Welcome message shows your actual name (top left)
   - [ ] User menu shows your name + email (top right)
   - [ ] Workout section has exercises (not empty)
   - [ ] Meal plan section has meals (not empty)
   - [ ] Progress stats show real numbers

### Test Case 4: Test Workout Completion
1. Click on a workout exercise checkbox
2. **Expected:**
   - [ ] Checkbox immediately toggles
   - [ ] Completion count increases (e.g., "1/4")
   - [ ] No console errors
3. Refresh page with F5
4. **Expected:**
   - [ ] Checkbox remains checked (data persisted to DB)

### Test Case 5: Test Meal Completion  
1. Click on a meal checkbox
2. **Expected:**
   - [ ] Checkbox toggles
   - [ ] Calorie count updates
   - [ ] No console errors
3. Refresh page
4. **Expected:**
   - [ ] Meal remains checked

### Test Case 6: Test AROMI Chat
1. On Dashboard, find AROMI chat box (top right)
2. Type: "What should I eat for breakfast?"
3. Press Enter or click Send button
4. **Expected:**
   - [ ] Message appears in blue on right side
   - [ ] Loading spinner shows briefly
   - [ ] AROMI response appears in gray
   - [ ] No errors in browser console

### Test Case 7: Update Health Profile
1. Click "Health Profile" in sidebar
2. Change a value (e.g., Weight: 70 → 68)
3. Click "Save Profile"
4. **Expected:**
   - [ ] Button shows "Saving..." then "Saved!"
   - [ ] Data persists on page refresh

### Test Case 8: Test with Different User
1. Click logout (top right user menu)
2. Register/login with **different email**: testuser2@example.com
3. On dashboard:
4. **Expected:**
   - [ ] New user's name shown (not Test User 1)
   - [ ] Could be different plans/progress

## Validation Checklist

### Frontend ✅
- [ ] Dashboard displays real user name
- [ ] Workout/meal data fetches from API
- [ ] Checkboxes save to database
- [ ] Stats update in real-time
- [ ] Loading spinners show during fetch
- [ ] Health profile form saves changes
- [ ] AROMI chat sends/receives messages
- [ ] Multi-user data isolation works
- [ ] No console errors on page load

### Backend ✅
- [ ] `/auth/register` returns 200 + token
- [ ] `/users/me` returns current user
- [ ] `/workouts/my-plan` returns workout JSON
- [ ] `/meals/my-plan` returns meal JSON
- [ ] `/workouts/complete-exercise` returns 200
- [ ] `/meals/complete-meal` returns 200
- [ ] `/dashboard/summary` returns stats
- [ ] `/aromi/chat` returns LLM response
- [ ] All protected routes require valid token
- [ ] 401 errors for missing/invalid tokens

## Troubleshooting

### Issue: "Cannot get workout plan"
**Solution:**
1. Check backend logs for errors
2. Verify health profile was created: `http://localhost:8000/users/me` (in browser after login)
3. Check if Groq API key is configured

### Issue: "Unauthorized 401"
**Solution:**
1. Clear browser localStorage: F12 → Application → Storage → Clear All
2. Logout and login again
3. Check if token is being sent: F12 → Network → (click any API call) → Headers → Authorization

### Issue: "Empty workout/meal list"
**Solution:**
1. Verify LLM generation worked in backend
2. Check database for workout_plan record
3. Verify JSON parsing in frontend (F12 → Console)

### Issue: "Changes not persisting"
**Solution:**
1. Check API response status: F12 → Network → (click POST call) → Response
2. Verify database connection in backend
3. Check for console errors in browser

## Browser Developer Tools Tips

### View API Calls:
1. F12 to open Developer Tools
2. Network tab
3. Make an action (e.g., click checkbox)
4. See POST/GET calls with status and response

### View Console Errors:
1. F12 → Console tab
2. Any red errors will show here
3. Copy error and include in bug report

### View Stored Data:
1. F12 → Application tab
2. LocalStorage → http://localhost:5173
3. See accessToken and other stored data

## Performance Tips

- Workouts and meals take 3-5 seconds to generate (first time)
- Subsequent logins load instantly (cached in DB)
- Checkout updates should be sub-second
- Chat responses take 2-10 seconds from Groq API

## Success Criteria

✅ Complete user flow succeeds when:
1. User can register
2. User sees health profile setup (first time)
3. User completes profile
4. Dashboard shows **different user data** for different logins
5. Checkboxes save and persist
6. Stats update correctly
7. AROMI responds to chat
8. No hardcoded "Priya" data anywhere

---

**Ready to test?** Start the servers above and follow the test cases! 🚀
