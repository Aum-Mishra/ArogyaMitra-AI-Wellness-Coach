# Plan Generation & Data Persistence Fixes

## Issues Fixed

### 1. **API Response Format Mismatch**
- **Problem**: Frontend was looking for `plan.plan_json` but backend returns `plan.plan` (parsed object)
- **Fix**: Both MealPlan.tsx and WorkoutPlan.tsx now handle both formats:
  ```typescript
  const planData = plan.plan || (typeof plan.plan_json === 'string' ? JSON.parse(plan.plan_json) : plan.plan_json);
  ```

### 2. **Settings Data Not Persisting**
- **Problem**: Only `name` field was being updated, phone/dob changes were lost on refresh
- **Fix**: Settings.tsx now:
  - Updates all user fields (name, phone, dob when provided)
  - Reloads user data after save to reflect changes
  - Shows success message only after verification

### 3. **Plan Generation Error Handling**
- **Problem**: Generation errors were silently caught and hidden from users
- **Fix**: HealthProfileSetup and Settings now:
  - Add detailed console logging for debugging
  - Show error messages to users
  - Wait for async responses properly

### 4. **Response Data Handling**
- **Problem**: Axios wraps responses in `.data` property, but code wasn't accounting for this
- **Fix**: Added proper data extraction:
  ```typescript
  const response = await apiClient.getMealPlan();
  const plan = response.data || response;
  ```

## Testing Checklist

### Test 1: Settings Data Persistence
1. Go to Settings page
2. Update Name field
3. Save changes → Should show "Saved!" message
4. Refresh page → Name should still be updated
5. ✓ **Expected**: Changes persist across page refresh

### Test 2: Plan Generation from Health Profile Setup
1. Complete registration
2. Go to Health Profile Setup (if not already there)
3. Fill all fields
4. Click "Complete Setup & Generate Plans"
5. Check browser console for logs:
   - Should see "Starting plan generation..."
   - Should see "Workout plan generated:"
   - Should see "Meal plan generated:"
6. ✓ **Expected**: No errors, plans visible in 2-3 seconds

### Test 3: Plan Generation from Settings
1. Go to Settings page
2. Scroll to "Generate Your Plans" section
3. Click "Generate Workout & Meal Plans"
4. Check browser console for logs
5. Should see success message: "Plans generated successfully!"
6. Navigate to Meal Plan page → Should see 7-day plan
7. Navigate to Workout Plan page → Should see 7-day workout
8. ✓ **Expected**: Both plans display with proper structure

### Test 4: Plan Display After Regeneration
1. After plan generation, go to Workout Plan page
2. Should NOT see "No workout plan generated yet" message
3. Should see 7 days with exercises
4. Go to Meal Plan page
5. Should NOT see "No meal plan generated yet" message
6. Should see 7 days with meals
7. ✓ **Expected**: Plans display immediately

### Test 5: Error Handling
1. Go to Settings
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Try to generate plans
5. If any errors occur, they should be:
   - Logged to console with details
   - Displayed as red error message on page
6. ✓ **Expected**: Errors are visible and informative

## Database Verification

### Check if plans are being saved:
```
1. Access database directly
2. Query meal_plans table:
   SELECT id, user_id, diet_type, created_at FROM meal_plans ORDER BY created_at DESC LIMIT 5;
3. Query workout_plans table:
   SELECT id, user_id, created_at FROM workout_plans ORDER BY created_at DESC LIMIT 5;
4. Verify records exist for your test user
```

## Browser Console Messages

When everything is working, you should see logs like:
```
Starting plan generation...
Generating workout plan...
Workout plan response: {id: 123, user_id: 456, plan: {...}, created_at: "2026-03-09..."}
Generating meal plan...
Meal plan response: {id: 124, user_id: 456, plan: {...}, created_at: "2026-03-09..."}
```

If you see these messages and then plans appear on the pages, the fixes are working correctly!

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No plan generated yet" after clicking button | Check browser console for error messages. Plans take 2-3 seconds to generate. |
| Settings changes don't persist | Clear browser cache and try again. Check that API is returning 200 status. |
| Plan shows empty days | Ensure health profile is complete with diet type and workout preference. |
| Generation button stays disabled | Check network tab in DevTools for failed requests. |
| Wrong plan structure displayed | Verify plan_json is a valid JSON string in database. |

## Code Changes Summary

### Files Modified:
1. **MealPlan.tsx** - Fixed plan fetching and response handling
2. **WorkoutPlan.tsx** - Fixed plan fetching and response handling  
3. **Settings.tsx** - Fixed data saving and loading, improved error handling
4. **HealthProfileSetup.tsx** - Added detailed logging and error reporting
5. **api.ts** - Added applyAromicAdjustment method

### Key Improvements:
- ✅ Console logging for debugging
- ✅ Proper response data extraction
- ✅ User-facing error messages
- ✅ Data persistence verification
- ✅ Handles both `.data` wrapped and direct responses
