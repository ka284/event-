# Registration Statistics Guide

This guide explains how to check registration statistics for your Event Management System using multiple methods.

## 📊 Methods to Check Registration Statistics

### 1. **Web Dashboard (Recommended)**
The easiest way to view registration statistics is through the Organizer Dashboard:

1. Log in as an organizer (use `user@example.com` / `password123`)
2. Navigate to the Organizer Dashboard
3. Click on the "Registration Stats" tab
4. View comprehensive statistics including:
   - Total registrations count
   - Revenue breakdown
   - Registration status distribution
   - Event type analytics
   - Top performing events
   - Recent registration activity

### 2. **API Endpoint**
Access registration data programmatically via the API:

```bash
curl http://localhost:3000/api/registrations
```

This returns a JSON response with:
- `totalRegistrations`: Total number of registrations
- `registrationsByStatus`: Breakdown by payment status
- `registrationsByEventType`: Distribution by event type
- `topEvents`: Events with highest registration counts
- `recentRegistrations`: Latest registration activity

### 3. **Direct Database Queries**
Run SQL queries directly on your SQLite database:

#### Using SQLite Command Line:
```bash
sqlite3 prisma/dev.db
```

Then run the queries from `check-registrations.sql`

#### Key SQL Queries:

**Total Registrations:**
```sql
SELECT COUNT(*) as total_registrations FROM orders;
```

**Registrations by Status:**
```sql
SELECT paymentStatus, COUNT(*) as count FROM orders GROUP BY paymentStatus;
```

**Top Events by Registrations:**
```sql
SELECT e.title, COUNT(o.id) as registration_count
FROM events e
LEFT JOIN orders o ON e.id = o.eventId
GROUP BY e.id, e.title
ORDER BY registration_count DESC
LIMIT 10;
```

**Total Revenue:**
```sql
SELECT SUM(finalCost) as total_revenue 
FROM orders 
WHERE paymentStatus = 'COMPLETED';
```

### 4. **Node.js Script**
Run the provided JavaScript script for detailed statistics:

```bash
node check-registrations.js
```

This script provides:
- Total registration count
- Payment status breakdown
- Total revenue calculation
- Top performing events
- Recent registration activity
- Event type distribution

## 📈 Available Statistics

### Overview Metrics
- **Total Registrations**: Count of all orders
- **Total Revenue**: Sum of completed order amounts
- **Completion Rate**: Percentage of completed vs pending orders

### Status Breakdown
- **PENDING**: Orders awaiting payment confirmation
- **COMPLETED**: Successfully paid orders
- **FAILED**: Failed payment attempts
- **REFUNDED**: Refunded orders

### Event Analytics
- **Event Type Distribution**: Registrations by event category
- **Top Events**: Events with highest registration counts
- **Revenue by Event**: Financial performance per event

### User Activity
- **Recent Registrations**: Latest booking activity
- **User Statistics**: Registration patterns by users

## 🔧 Database Schema

The registration data is stored across these tables:

- **`orders`**: Main registration records
- **`events`**: Event information
- **`users`**: User accounts
- **`organizers`**: Event organizers

### Key Relationships
- `orders.userId` → `users.id`
- `orders.eventId` → `events.id`
- `events.organizerId` → `organizers.id`

## 📊 Example Output

When you run the registration statistics check, you'll see output like:

```
📊 Event Management System - Registration Statistics

📈 Total Registrations: 156

💳 Registrations by Payment Status:
  COMPLETED: 142
  PENDING: 12
  FAILED: 2

💰 Total Revenue: ₹2,845,000

🏆 Top 5 Events by Registrations:
  1. Tech Conference 2024 (CONFERENCE) - 45 registrations
  2. Digital Marketing Summit (SUMMIT) - 32 registrations
  3. AI Workshop (WORKSHOP) - 28 registrations

📊 Event Type Distribution:
  CONFERENCE: 67
  WORKSHOP: 45
  SUMMIT: 32
  FESTIVAL: 12
```

## 🚀 Getting Started

1. **Ensure your development server is running**:
   ```bash
   npm run dev
   ```

2. **Access the dashboard**:
   - Visit http://localhost:3000
   - Log in with organizer credentials
   - Navigate to Organizer Dashboard → Registration Stats

3. **Or run the script**:
   ```bash
   node check-registrations.js
   ```

4. **Or query the database directly**:
   ```bash
   sqlite3 prisma/dev.db < check-registrations.sql
   ```

## 📋 Troubleshooting

### Common Issues:

1. **No data showing**:
   - Ensure you have sample data in your database
   - Check that the development server is running
   - Verify database connection

2. **API endpoint not working**:
   - Check server logs for errors
   - Ensure the API route is properly configured
   - Verify database connectivity

3. **Script errors**:
   - Ensure all dependencies are installed
   - Check Prisma configuration
   - Verify database file exists

### Database Location:
- SQLite database: `prisma/dev.db`
- Schema: `prisma/schema.prisma`

## 🎯 Best Practices

1. **Regular Monitoring**: Check registration statistics daily for active events
2. **Revenue Tracking**: Monitor completed vs pending payments
3. **Event Performance**: Identify top-performing event types
4. **User Engagement**: Track registration patterns and user activity

## 📞 Support

If you encounter any issues with registration statistics:
1. Check the browser console for JavaScript errors
2. Review server logs for API errors
3. Verify database connectivity
4. Ensure proper user authentication

This comprehensive system provides multiple ways to monitor and analyze your event registration data!