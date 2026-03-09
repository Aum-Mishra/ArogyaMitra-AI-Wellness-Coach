# Step-by-Step Testing Guide for Plan Generation & Data Persistence Fixes

## Quick Start - 5 Minute Test

### Test Settings Data Persistence (2 min)
1. Login to the app
2. Go to **Settings** page
3. Find the "Account Settings" section
4. Change **Name** to something new (e.g., "Test User 2")
5. Scroll down and click **"Save Changes"** button
6. Wait for "Saved!" message to appear
7. **Refresh the page** (Ctrl+R or Cmd+R)
8. ✅ **Expected Result**: Name should still show the updated value

**If this doesn't work**: Check browser console (F12 → Console tab) for error messages

---

### Test Plan Generation (3 min)
1. Go to **Settings** page
2. Scroll down to **"Generate Your Plans"** section
3. Open browser **Developer Tools** (F12)
4. Go to **Console** tab
5. Click **"Generate Workout & Meal Plans"** button
6. In the Console, you should see messages like:
   - `Generating workout plan with data: {...}`
   - `Generating meal plan with data: {...}`
7. Wait 3-5 seconds for generation to complete
8. Look for **green success message**: "Plans generated successfully!"
9. Now navigate to **Meal Plan** page
   - Should show 7 days with meals, NOT the "No meal plan" message
10. Navigate to **Workout Plan** page
    - Should show 7 days with exercises, NOT the "No workout plan" message

**If this doesn't work**:
- Check Console for error messages (red lines)
- Look for response errors that mention the API
- Ensure all network requests in Network tab returned 200-299 status

---

## Complete Testing Scenario

### Prerequisites
- Fresh user account OR existing user without plans
- Browser Console open (F12)

### Step 1: Register New User
1. Go to Login page
2. Click "Don't have an account? Register"
3. Fill registration form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: Any secure password
   - Age: 25
   - Gender: (Select any)
   - Height: 180
   - Weight: 75
4. Click **Register**
5. Should be redirected to Health Profile Setup

### Step 2: Complete Health Profile Setup
1. Fill the Health Profile form:
   - **Diet Type**: Select "Vegetarian"
   - **Allergies**: Leave empty or enter a few
   - **Medical Conditions**: Leave empty or enter a few
   - **Time Available**: Enter 60 (minutes)
   - **Workout Preference**: Select "Gym"
2. Open **Console tab** in Developer Tools
3. Click **"Complete Setup & Generate Plans"** button
4. Watch Console for generation logs:
   ```
   Starting plan generation...
   Generating workout plan...
   Workout plan generated: {id: 123, ...}
   Generating meal plan...
   Meal plan generated: {id: 124, ...}
   ```
5. If you see these logs without errors, **generation succeeded**!
6. Should redirect to home page (Dashboard)

### Step 3: Verify Plan Display
1. From Dashboard, click **Meal Plan** in navigation
   - Should show "Your Meal Plan" header
   - Should show 7 days (Day 1-7)
   - Should show meals with calories and descriptions
   - Should NOT show "No meal plan generated yet" message

2. From Dashboard, click **Workout Plan** in navigation
   - Should show "Your Workout Plan" header
   - Should show 7 days (Day 1-7)
   - Should show exercises with sets/reps or duration
   - Should NOT show "No workout plan generated yet" message

### Step 4: Test Plan Regeneration
1. Go to **Settings** page
2. Scroll to **"Generate Your Plans"** section
3. Open Console
4. Click **"Generate Workout & Meal Plans"**
5. Watch Console for logs
6. Wait for success message
7. Go to Meal Plan page → Click Day 1 tab
8. Go to Workout Plan page → Click Day 1 tab
9. Plans should show (even if same as before)

### Step 5: Test Settings Data Persistence
1. In Settings, find **Account Settings** section
2. Edit any field (e.g., change Name)
3. Scroll down and click **"Save Changes"**
4. Wait for "Saved!" confirmation
5. **Refresh page** (Ctrl+R)
6. Verify your changes are still there

---

## If You Find Issues

### Capture for Bug Report:
1. Browser console full log
2. Network tab response data
3. Steps to reproduce
4. Expected vs actual behavior

### Quick Fixes to Try:
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Settings → Clear browsing data
3. **Restart servers**: Stop and restart both backend and frontend
