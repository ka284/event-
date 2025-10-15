-- SQL Queries to Check Registration Statistics
-- These queries can be run directly on your SQLite database

-- 1. Get total number of registrations
SELECT COUNT(*) as total_registrations FROM orders;

-- 2. Get registrations by payment status
SELECT 
  paymentStatus,
  COUNT(*) as count
FROM orders 
GROUP BY paymentStatus;

-- 3. Get registrations by event type
SELECT 
  e.type,
  COUNT(*) as registration_count
FROM orders o
JOIN events e ON o.eventId = e.id
GROUP BY e.type
ORDER BY registration_count DESC;

-- 4. Get top events by registration count
SELECT 
  e.title,
  e.type,
  e.price,
  COUNT(o.id) as registration_count
FROM events e
LEFT JOIN orders o ON e.id = o.eventId
GROUP BY e.id, e.title, e.type, e.price
ORDER BY registration_count DESC
LIMIT 10;

-- 5. Get recent registrations
SELECT 
  o.id,
  o.bookingDate,
  o.paymentStatus,
  o.finalCost,
  u.email as user_email,
  u.name as user_name,
  e.title as event_title,
  e.type as event_type
FROM orders o
JOIN users u ON o.userId = u.id
JOIN events e ON o.eventId = e.id
ORDER BY o.bookingDate DESC
LIMIT 20;

-- 6. Get total revenue by payment status
SELECT 
  paymentStatus,
  SUM(finalCost) as total_revenue
FROM orders 
GROUP BY paymentStatus;

-- 7. Get monthly registration trends
SELECT 
  strftime('%Y-%m', bookingDate) as month,
  COUNT(*) as registrations,
  SUM(finalCost) as revenue
FROM orders
GROUP BY strftime('%Y-%m', bookingDate)
ORDER BY month DESC;

-- 8. Get organizer-wise registration statistics
SELECT 
  org.name as organizer_name,
  COUNT(o.id) as total_registrations,
  SUM(CASE WHEN o.paymentStatus = 'COMPLETED' THEN o.finalCost ELSE 0 END) as total_revenue
FROM organizers org
JOIN events e ON org.id = e.organizerId
LEFT JOIN orders o ON e.id = o.eventId
GROUP BY org.id, org.name
ORDER BY total_registrations DESC;

-- 9. Get event registration details with organizer information
SELECT 
  e.title as event_title,
  e.type as event_type,
  e.price as event_price,
  org.name as organizer_name,
  COUNT(o.id) as registration_count,
  SUM(CASE WHEN o.paymentStatus = 'COMPLETED' THEN o.finalCost ELSE 0 END) as revenue
FROM events e
JOIN organizers org ON e.organizerId = org.id
LEFT JOIN orders o ON e.id = o.eventId
GROUP BY e.id, e.title, e.type, e.price, org.name
ORDER BY registration_count DESC;

-- 10. Get user registration activity
SELECT 
  u.email,
  u.name,
  COUNT(o.id) as total_registrations,
  SUM(CASE WHEN o.paymentStatus = 'COMPLETED' THEN o.finalCost ELSE 0 END) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.userId
GROUP BY u.id, u.email, u.name
ORDER BY total_registrations DESC
LIMIT 20;