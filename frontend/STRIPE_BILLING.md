# Stripe Billing & Subscription System

Complete subscription management system with Stripe integration for Hireoo.

## Overview

The billing system provides:

1. **Three-Tier Pricing**: Free, Pro Monthly ($29), Pro Yearly ($290)
2. **Stripe Checkout**: Secure payment processing
3. **Customer Portal**: Self-service subscription management
4. **Webhook Integration**: Real-time subscription status updates
5. **Usage Tracking**: Feature limits and analytics
6. **Route Protection**: Subscription-based feature access

## Architecture

### Core Components

```
Billing System:
├── Stripe Service → Payment processing & customer management
├── Subscription Middleware → Feature access control
├── Database Models → Subscription & plan storage
├── API Endpoints → Checkout, portal, and subscription management
├── Webhook Handler → Real-time status updates
├── Dashboard UI → Plan management interface
└── Usage Tracking → Feature limit enforcement
```

### Subscription Plans

| Plan | Price | Job Matches | Emails | AI Features | Analytics | Support |
|------|-------|-------------|--------|-------------|-----------|---------|
| Free | $0 | 10/month | 5/month | ❌ | ❌ | ❌ |
| Pro Monthly | $29 | Unlimited | 100/month | ✅ | ✅ | ✅ |
| Pro Yearly | $290 | Unlimited | 100/month | ✅ | ✅ | ✅ |

## Database Schema

### Subscription Model

```prisma
model Subscription {
  id                    String    @id @default(cuid())
  user_id               String    @unique
  stripe_customer_id    String?   @unique // Stripe customer ID
  stripe_subscription_id String?  @unique // Stripe subscription ID
  stripe_price_id       String?   // Current price ID
  plan_name             String    // free, pro_monthly, pro_yearly
  status                String    @default("active") // active, canceled, past_due
  current_period_start  DateTime?
  current_period_end    DateTime?
  cancel_at_period_end  Boolean   @default(false)
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### SubscriptionPlan Model

```prisma
model SubscriptionPlan {
  id          String  @id @default(cuid())
  name        String  @unique // free, pro_monthly, pro_yearly
  display_name String // "Free", "Pro Monthly", "Pro Yearly"
  description String?
  stripe_price_id String @unique
  price       Float   // Price in USD
  currency    String  @default("usd")
  interval    String? // month, year (null for free)
  features    Json    // Feature limits and capabilities
  is_active   Boolean @default(true)
  created_at  DateTime @default(now())
}
```

## Stripe Integration

### Environment Setup

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_PRO_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_PRO_YEARLY=price_your_yearly_price_id
```

### Plan Configuration

```typescript
const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    features: {
      monthlyJobMatches: 10,
      monthlyEmails: 5,
      aiEmailGeneration: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  PRO_MONTHLY: {
    name: 'pro_monthly',
    displayName: 'Pro Monthly',
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    features: { /* full access */ },
  },
  // ... pro_yearly
}
```

## API Endpoints

### POST `/api/billing/checkout`

Create Stripe checkout session for subscription.

**Request:**
```json
{
  "planName": "pro_monthly" // or "pro_yearly"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

**Process:**
1. Validate plan name
2. Create/retrieve Stripe customer
3. Generate checkout session
4. Return Stripe checkout URL

### POST `/api/billing/portal`

Create customer portal session for subscription management.

**Response:**
```json
{
  "portalUrl": "https://billing.stripe.com/..."
}
```

### GET `/api/billing/subscription`

Get user's subscription and usage information.

**Response:**
```json
{
  "subscription": {
    "planName": "pro_monthly",
    "status": "active",
    "currentPeriodEnd": "2024-02-15T00:00:00Z"
  },
  "usage": {
    "canUse": true,
    "limits": {
      "monthlyJobMatches": 10,
      "monthlyEmails": 5,
      "currentJobMatches": 3,
      "currentEmails": 1
    }
  }
}
```

## Webhook Handling

### POST `/api/webhooks/stripe`

Stripe webhook endpoint for real-time subscription updates.

**Supported Events:**
- `checkout.session.completed` - Initial subscription creation
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

**Security:**
- Webhook signature verification
- Event deduplication
- Database transaction safety

**Process:**
1. Verify webhook signature
2. Parse event data
3. Update subscription status
4. Handle specific event types
5. Log all activities

## Subscription Middleware

### Feature Access Control

```typescript
// Check feature access
const access = await SubscriptionMiddleware.checkFeatureAccess(
  userId,
  'email_generation' // or 'job_matching', 'advanced_analytics'
)

// Returns: { hasAccess: boolean, reason?: string }
```

### Route Protection

```typescript
// Protect API routes
export const POST = SubscriptionMiddleware.requireSubscription(
  async (request) => {
    // Your API logic here
    return NextResponse.json({ success: true })
  },
  'email_generation' // Required feature
)
```

### Usage Limit Enforcement

```typescript
// Check free plan limits
const limits = await StripeService.checkUsageLimits(userId)
// Returns current usage vs. limits
```

## Dashboard UI

### Billing Page (`/dashboard/billing`)

**Features:**
- Current plan display with status
- Usage tracking (free plan)
- Plan comparison cards
- Upgrade buttons with Stripe Checkout
- Customer portal access
- FAQ section

**Plan Cards:**
- Free: $0/month, basic features
- Pro Monthly: $29/month, full features
- Pro Yearly: $290/year (17% savings), premium features

**Usage Visualization:**
- Progress bars for job matches and emails
- Limit warnings and upgrade prompts
- Real-time usage updates

## Setup Instructions

### 1. Stripe Dashboard Setup

1. **Create Products:**
   - Pro Monthly: Recurring price $29/month
   - Pro Yearly: Recurring price $290/year

2. **Get Price IDs:**
   - Copy price IDs from Stripe dashboard
   - Add to environment variables

3. **Configure Webhooks:**
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: checkout.session.completed, customer.subscription.*, invoice.*
   - Copy webhook secret to environment

### 2. Database Setup

```bash
# Seed subscription plans
npm run seed-plans

# Run database migrations
npx prisma migrate deploy
```

### 3. Environment Configuration

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Next.js
NEXTAUTH_URL=https://yourdomain.com
```

## Usage Examples

### Upgrade Flow

```typescript
// User clicks "Upgrade to Pro"
const response = await fetch('/api/billing/checkout', {
  method: 'POST',
  body: JSON.stringify({ planName: 'pro_monthly' })
})

const { checkoutUrl } = await response.json()
window.location.href = checkoutUrl // Redirect to Stripe Checkout
```

### Feature Protection

```typescript
// API route with subscription check
export const POST = SubscriptionMiddleware.requireSubscription(
  async (request) => {
    // Generate AI email (Pro feature)
    const email = await EmailGeneratorService.generateColdEmail(jobInfo, userInfo)
    return NextResponse.json({ email })
  },
  'email_generation'
)
```

### Usage Tracking

```typescript
// Check if user can use feature
const { hasAccess, reason } = await SubscriptionMiddleware.checkFeatureAccess(
  userId,
  'job_matching'
)

if (!hasAccess) {
  // Show upgrade prompt with reason
  showUpgradeModal(reason)
}
```

## Monitoring & Analytics

### Subscription Metrics

```sql
-- Active subscriptions by plan
SELECT plan_name, COUNT(*) as count
FROM "Subscription"
WHERE status = 'active'
GROUP BY plan_name

-- Monthly recurring revenue
SELECT
  SUM(CASE
    WHEN plan_name = 'pro_monthly' THEN 29
    WHEN plan_name = 'pro_yearly' THEN 290/12
    ELSE 0
  END) as mrr
FROM "Subscription"
WHERE status = 'active'

-- Churn rate
SELECT
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) * 100.0 / COUNT(*) as churn_rate
FROM "Subscription"
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
```

### Usage Analytics

```sql
-- Feature usage by plan
SELECT
  s.plan_name,
  COUNT(jm.id) as job_matches_used,
  COUNT(el.id) as emails_sent
FROM "Subscription" s
LEFT JOIN "JobMatch" jm ON s.user_id = jm.user_id
LEFT JOIN "EmailLog" el ON s.user_id = el.user_id AND el.direction = 'sent'
WHERE s.status = 'active'
GROUP BY s.plan_name
```

## Error Handling

### Common Issues

- **Webhook Signature Verification**: Invalid webhook secret
- **Customer Creation**: Duplicate customer emails
- **Subscription Updates**: Race conditions in webhook processing
- **Usage Limits**: Concurrent limit checking

### Recovery Strategies

- **Webhook Retries**: Stripe automatically retries failed webhooks
- **Idempotency**: Webhook event deduplication
- **Graceful Degradation**: Allow access during temporary issues
- **User Notifications**: Clear error messages and support contact

## Security Considerations

### Data Protection

- **PCI Compliance**: Stripe handles all payment data
- **Webhook Verification**: Cryptographic signature validation
- **Environment Variables**: Secure credential storage
- **Access Control**: User-scoped data access

### Privacy

- **Minimal Data Storage**: Only essential billing information
- **Stripe Customer Portal**: User-controlled data management
- **Audit Logging**: Complete transaction history
- **GDPR Compliance**: Data deletion and export capabilities

## Future Enhancements

### Advanced Features

- **Proration**: Mid-cycle plan changes with proper billing
- **Coupons**: Discount codes and promotional pricing
- **Team Plans**: Multi-user subscriptions
- **Usage-Based Billing**: Pay-as-you-go for high-volume users
- **Dunning Management**: Automated failed payment recovery

### Analytics & Insights

- **Conversion Funnels**: Track upgrade flows and drop-offs
- **Feature Usage**: Most/least used premium features
- **Churn Prediction**: ML-based cancellation risk assessment
- **Revenue Analytics**: Detailed subscription and billing metrics

### Integration Points

- **CRM Integration**: Customer data synchronization
- **Email Marketing**: Automated upgrade reminders
- **Support System**: Subscription-based ticket routing
- **Business Intelligence**: Advanced reporting and dashboards

This Stripe billing system provides a complete, production-ready subscription management solution with robust error handling, comprehensive monitoring, and seamless user experience integration.


