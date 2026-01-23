#!/bin/bash

# AadhaarQMS Backend API Testing Script
# This script tests all major API endpoints

BASE_URL="http://localhost:5000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  AadhaarQMS Backend API Testing Script"
echo "================================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
echo $HEALTH_RESPONSE | jq '.'
echo ""

# Test 2: Create Default Admin
echo -e "${YELLOW}Test 2: Create Default Admin${NC}"
curl -s -X POST "$BASE_URL/api/auth/admin/create-default" | jq '.'
echo ""

# Test 3: Admin Login
echo -e "${YELLOW}Test 3: Admin Login${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aadhaarqms.com",
    "password": "Admin@123"
  }')
echo $ADMIN_LOGIN_RESPONSE | jq '.'
ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | jq -r '.token')
echo -e "${GREEN}Admin Token: $ADMIN_TOKEN${NC}"
echo ""

# Test 4: User Registration
echo -e "${YELLOW}Test 4: User Registration${NC}"
USER_REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "9876543210",
    "password": "Test@123"
  }')
echo $USER_REG_RESPONSE | jq '.'
USER_TOKEN=$(echo $USER_REG_RESPONSE | jq -r '.token')
echo -e "${GREEN}User Token: $USER_TOKEN${NC}"
echo ""

# Test 5: User Login
echo -e "${YELLOW}Test 5: User Login${NC}"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@123"
  }' | jq '.'
echo ""

# Test 6: Book Appointment
echo -e "${YELLOW}Test 6: Book Appointment${NC}"
APPOINTMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/appointment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "9876543210",
    "aadhaarNumber": "123456789012",
    "serviceType": "New Aadhaar Enrollment",
    "date": "2026-02-01",
    "timeSlot": "10:00 - 11:00"
  }')
echo $APPOINTMENT_RESPONSE | jq '.'
APPOINTMENT_ID=$(echo $APPOINTMENT_RESPONSE | jq -r '.data.appointmentId')
echo -e "${GREEN}Appointment ID: $APPOINTMENT_ID${NC}"
echo ""

# Test 7: Get User's Appointments
echo -e "${YELLOW}Test 7: Get User's Appointments${NC}"
curl -s -X GET "$BASE_URL/api/my-appointments" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.'
echo ""

# Test 8: Get All Appointments (Admin)
echo -e "${YELLOW}Test 8: Get All Appointments (Admin)${NC}"
curl -s -X GET "$BASE_URL/api/admin/appointments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 9: Update Appointment Status (Admin)
echo -e "${YELLOW}Test 9: Update Appointment Status to 'In Progress' (Admin)${NC}"
curl -s -X PUT "$BASE_URL/api/admin/appointment/$APPOINTMENT_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "In Progress"
  }' | jq '.'
echo ""

# Test 10: Get Dashboard Analytics (Admin)
echo -e "${YELLOW}Test 10: Get Dashboard Analytics (Admin)${NC}"
curl -s -X GET "$BASE_URL/api/admin/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 11: Get Today's Queue
echo -e "${YELLOW}Test 11: Get Today's Queue Status${NC}"
curl -s -X GET "$BASE_URL/api/queue/today" | jq '.'
echo ""

# Test 12: Get Single Appointment
echo -e "${YELLOW}Test 12: Get Single Appointment${NC}"
curl -s -X GET "$BASE_URL/api/appointment/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.'
echo ""

echo "================================================"
echo -e "${GREEN}✅ All API Tests Completed!${NC}"
echo "================================================"
echo ""
echo "Tokens for manual testing:"
echo -e "${GREEN}User Token: $USER_TOKEN${NC}"
echo -e "${GREEN}Admin Token: $ADMIN_TOKEN${NC}"
echo -e "${GREEN}Appointment ID: $APPOINTMENT_ID${NC}"