# No-Show Detector Lambda — Deployment Guide

## Overview
This Lambda runs on a schedule replacing (or backing up) the in-process `setInterval` scheduler.
It uses the `center-date-index` GSI to avoid expensive full table scans.

---

## Step 1 — Package the Lambda

Run this from the `backend/lambda/noShowDetector/` directory:

```bash
# Windows PowerShell
Compress-Archive -Path index.js, package.json -DestinationPath noShowDetector.zip -Force

# Mac/Linux
zip noShowDetector.zip index.js package.json
```

> ✅ No `npm install` needed — `aws-sdk` v2 is pre-bundled in the Lambda Node.js runtime.

---

## Step 2 — Create the Lambda Function

1. Go to **AWS Console → Lambda → Create function**
2. Settings:
   | Field | Value |
   |---|---|
   | Function name | `AadhaarQMS-NoShowDetector` |
   | Runtime | `Node.js 18.x` |
   | Architecture | `x86_64` |
   | Execution role | Create new (see Step 3) |

3. Upload the zip: **Code → Upload from → .zip file** → select `noShowDetector.zip`
4. Set handler: `index.handler`

---

## Step 3 — IAM Role Permissions

Add this **inline policy** to the Lambda execution role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:*:table/AadhaarQMS_Appointments",
        "arn:aws:dynamodb:ap-south-1:*:table/AadhaarQMS_Appointments/index/*",
        "arn:aws:dynamodb:ap-south-1:*:table/AadhaarQMS_Centers",
        "arn:aws:dynamodb:ap-south-1:*:table/AadhaarQMS_Users"
      ]
    }
  ]
}
```

---

## Step 4 — Environment Variables

In Lambda → **Configuration → Environment variables**, add:

| Key | Value |
|---|---|
| `AWS_REGION_OVERRIDE` | `ap-south-1` |
| `APPOINTMENTS_TABLE` | `AadhaarQMS_Appointments` |
| `CENTERS_TABLE` | `AadhaarQMS_Centers` |
| `USERS_TABLE` | `AadhaarQMS_Users` |
| `NO_SHOW_GRACE_MINUTES` | `15` |
| `MAX_NO_SHOWS_BEFORE_BLOCK` | `3` |
| `BLOCK_DURATION_DAYS` | `30` |

> Note: Lambda's built-in `AWS_REGION` is reserved; use `AWS_REGION_OVERRIDE` instead.

---

## Step 5 — EventBridge Schedule (Cron Trigger)

1. Go to **Lambda → Configuration → Triggers → Add trigger**
2. Select **EventBridge (CloudWatch Events)**
3. Create new rule:
   | Field | Value |
   |---|---|
   | Rule name | `AadhaarQMS-NoShow-Every5Min` |
   | Rule type | Schedule expression |
   | Schedule | `cron(0/5 2,30 * * ? *)` |

   > **Cron explanation**: Runs every 5 minutes from **07:30 UTC to 14:30 UTC** = **13:00 IST to 20:00 IST** (center hours).
   > This ensures the Lambda only runs during working hours — zero cost outside those hours.

   **Alternative (simpler, runs 24/7):**
   ```
   rate(5 minutes)
   ```

4. Enable the trigger.

---

## Step 6 — Test Manually

In Lambda Console → **Test** tab:

```json
{
  "source": "manual-test"
}
```

Check **CloudWatch Logs** (`/aws/lambda/AadhaarQMS-NoShowDetector`) to verify output like:
```
📅 Today (IST): 2026-04-08  |  Current IST: 14:30  |  Grace: 15 min
🏢 Active centers found: 3
  ✅ Marked NO_SHOW: APPT-abc123 (slot: 13:00 - 14:00)
  ↳ User user-xyz — noShowCount: 1
✅ Lambda complete: { today: '2026-04-08', centersProcessed: 3, totalNoShowsMarked: 1 }
```

---

## Cost Summary

| Resource | Usage | Free Tier | Monthly Cost |
|---|---|---|---|
| Lambda invocations | ~432/month (5min × 10hrs × 30days) | 1,000,000/month free | **₹0** |
| Lambda compute | ~1s per run | 400,000 GB-sec/month free | **₹0** |
| EventBridge | 432 triggers | 14M events/month free | **₹0** |
| DynamoDB reads | ~10 queries per run | 25 RCU free | **₹0** |

**Total cost: ₹0/month** 🎉

---

## Relationship with In-Process Scheduler

The Express server also runs `schedulerService.js` (every 5 min via `setInterval`).

| | In-Process Scheduler | Lambda |
|---|---|---|
| Runs when | Server is up | Always (EventBridge) |
| Restart-safe | ❌ Stops if server restarts | ✅ Always runs |
| Cost | Free (uses server) | Free (Lambda free tier) |
| Reliability | Medium | High |

Both run simultaneously — Lambda is the primary, Express is the fallback.
