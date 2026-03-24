# Inquiry Workflow System - Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions to test the complete inquiry workflow system with real-time status tracking across all user roles.

## 📋 Prerequisites
1. Ensure backend server is running on `http://localhost:5001`
2. Ensure frontend is running on `http://localhost:5173`
3. Database should be cleared or have fresh data for clean testing

## 🔄 Complete Workflow Testing

### Step 1: User Submits Inquiry
**Action:**
1. Navigate to Inquiry Page (`/inquiry`)
2. Fill out the inquiry form with valid data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "1234567890"
   - Hiring For: "artist" or "influencer"
   - Category: "Singer"
   - Location: "Mumbai"
   - Event Type: "Birthday Party"
   - Event Date: Future date
   - Budget: "25000"
   - Requirements: "Test requirements for workflow validation"
3. Submit the form

**Expected Result:**
- Inquiry created with status: `sent`
- Progress: 10%
- User can see inquiry in User Dashboard
- Admin can see inquiry in Admin Dashboard

### Step 2: Admin Reviews and Accepts
**Action:**
1. Login as Admin (email: admin@example.com, password: admin123)
2. Navigate to Admin Dashboard → Inquiries tab
3. Find the newly created inquiry (status: "sent")
4. Click "Accept" button

**Expected Result:**
- Inquiry status updates to: `admin_accepted`
- Progress updates to: 40%
- Workflow history entry created
- User sees updated status in their dashboard
- "Forward" button becomes available for admin

### Step 3: Admin Forwards to Artist
**Action:**
1. In Admin Dashboard, find the accepted inquiry
2. Click "Forward" button
3. Select one or more artists from the list
4. Confirm forwarding

**Expected Result:**
- Inquiry status updates to: `forwarded`
- Progress updates to: 60%
- Artists receive the inquiry in their dashboard
- User sees "Forwarded to Artist" status
- Workflow history updated

### Step 4: Artist Reviews and Responds
**Action:**
1. Login as an Artist account
2. Navigate to Artist Dashboard → Inquiries tab
3. Find the forwarded inquiry
4. Click "Accept Inquiry" or "Decline Inquiry"

**Expected Result:**
- If accepted: Status → `artist_accepted`, Progress → 80%
- If rejected: Status → `artist_rejected`, Progress → 100%
- Admin receives notification of artist response
- User sees updated status in real-time

### Step 5: Admin Completes the Workflow
**Action:**
1. Login as Admin
2. Navigate to Admin Dashboard → Inquiries
3. Find inquiry with artist response
4. Click "Complete" button

**Expected Result:**
- Status updates to: `completed`
- Progress updates to: 100%
- User receives final notification
- Workflow marked as complete

## 🧪 Test Scenarios

### Scenario A: Happy Path (All Accepted)
1. User submits inquiry
2. Admin accepts
3. Admin forwards to artist
4. Artist accepts
5. Admin completes
**Result:** Complete workflow with 100% progress

### Scenario B: Admin Rejection
1. User submits inquiry
2. Admin rejects immediately
**Result:** Workflow ends at 100% progress with "admin_rejected" status

### Scenario C: Artist Rejection
1. User submits inquiry
2. Admin accepts
3. Admin forwards to artist
4. Artist rejects
**Result:** Workflow ends at 100% progress with "artist_rejected" status

## 🔍 Validation Points

### Backend Validation
- [ ] Inquiry model fields are correctly populated
- [ ] Status transitions follow the correct sequence
- [ ] Progress percentages are accurate
- [ ] Workflow history is maintained
- [ ] API endpoints return correct responses

### Frontend Validation
- [ ] Progress bar displays correctly at each stage
- [ ] Status badges show correct colors and labels
- [ ] Workflow history displays in user dashboard
- [ ] Real-time updates reflect across all dashboards
- [ ] Action buttons appear/disappear based on status

### Notification System Validation
- [ ] Notifications appear for status changes
- [ ] Notification count updates correctly
- [ ] Notifications can be marked as read
- [ ] Different notification types have correct icons and colors

## 🐛 Common Issues & Solutions

### Issue 1: Status Not Updating
**Cause:** Frontend not refetching data after status change
**Solution:** Check API calls and state updates in dashboard components

### Issue 2: Progress Bar Not Showing
**Cause:** Missing InquiryProgressBar component import
**Solution:** Ensure component is imported and used correctly

### Issue 3: Artists Not Receiving Inquiries
**Cause:** Forwarding logic not working correctly
**Solution:** Check `forwardedTo` array population and artist query logic

### Issue 4: Notifications Not Appearing
**Cause:** NotificationContext not properly integrated
**Solution:** Verify NotificationProvider wraps the app and NotificationToast is rendered

## 📊 Expected Database State After Complete Workflow

```javascript
{
  _id: "inquiry_id",
  userId: "user_id",
  status: "completed",
  progressPercentage: 100,
  adminStatus: "accepted",
  artistStatus: "accepted",
  assignedArtist: {
    userId: "artist_id",
    assignedBy: "admin_id",
    assignedAt: "timestamp"
  },
  forwardedTo: [
    {
      userId: "artist_id",
      forwardedBy: "admin_id",
      forwardedAt: "timestamp"
    }
  ],
  workflowHistory: [
    { stage: "admin_review", status: "admin_accepted", updatedBy: "admin_id" },
    { stage: "forwarded", status: "forwarded", updatedBy: "admin_id" },
    { stage: "artist_response", status: "artist_accepted", updatedBy: "artist_id" },
    { stage: "completed", status: "completed", updatedBy: "admin_id" }
  ]
}
```

## ✅ Success Criteria

The workflow system is working correctly when:

1. **Complete Status Tracking:** All status transitions are properly tracked and stored
2. **Progress Visualization:** Progress bar accurately reflects workflow completion
3. **Real-time Updates:** All dashboards show current status immediately
4. **Workflow History:** Complete audit trail of all actions is maintained
5. **Role-based Actions:** Users only see relevant actions based on their role and inquiry status
6. **Notification System:** Users receive timely notifications for status changes
7. **Error Handling:** System gracefully handles edge cases and errors

## 🚀 Production Deployment Notes

1. **Environment Variables:** Ensure all API URLs are correctly configured
2. **Database Indexes:** Add indexes for performance on frequently queried fields
3. **Notification Persistence:** Consider using WebSocket or Server-Sent Events for true real-time updates
4. **Security:** Validate all user permissions at each workflow step
5. **Monitoring:** Add logging for workflow transitions and errors

---

## 📞 Support

If you encounter any issues during testing:
1. Check browser console for JavaScript errors
2. Verify backend API responses in Network tab
3. Check database state directly
4. Review the workflow history for debugging information

This comprehensive testing guide ensures your inquiry workflow system works perfectly across all user roles and scenarios!
