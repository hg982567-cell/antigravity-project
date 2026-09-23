const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { id: "getting-started", name: "Getting Started", icon: "Rocket", description: "Essential guides for launching, configuring, and connecting your DropAI store." },
  { id: "product-research-ai", name: "Product Research & AI", icon: "Search", description: "Discover high-margin winning products, run AI market analysis, and generate high-converting ads." },
  { id: "shopify-integrations", name: "Shopify & Store Integrations", icon: "Store", description: "Connect official store bridges using OAuth PKCE, manage webhooks, and automate catalog sync." },
  { id: "automations-fulfillment", name: "Automations & Fulfillment", icon: "Zap", description: "Configure autonomous supplier fallback, carrier tracking sync, and fraud hold thresholds." },
  { id: "orders", name: "Orders & Lifecycle", icon: "ShoppingCart", description: "Understand order state machines, timelines, carrier fulfillment, and customer return workflows." },
  { id: "payments-currency", name: "Payments, Currency & Profit", icon: "DollarSign", description: "Master base vs display currencies, live exchange rates, fee deductions, and net profit margins." },
  { id: "security-account", name: "Security & Account", icon: "Shield", description: "Secure your account with TOTP 2FA, review active device sessions, and understand data isolation." },
  { id: "troubleshooting", name: "Troubleshooting Center", icon: "HelpCircle", description: "Step-by-step diagnostic workflows for Shopify connections, missing syncs, webhooks, and auth." },
  { id: "developer-api", name: "Developer & Technical API", icon: "Code", description: "Technical documentation covering REST APIs, webhook HMAC signatures, and multi-tenant design." },
  { id: "admin-system", name: "Admin & System Operations", icon: "Lock", description: "Platform control center guides, user access management, universal AI models, and disaster recovery." },
];

const ARTICLES = [
  // --- GETTING STARTED (13 articles) ---
  {
    slug: "what-is-dropai",
    title: "What is DropAI?",
    description: "An overview of DropAI: the autonomous ecommerce intelligence platform built for dropshipping merchants and modern retail brands.",
    category: "getting-started",
    subcategory: "Platform Basics",
    tags: "overview, introduction, platform, ai, dropshipping",
    readingTime: "4 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Platform Overview

DropAI is an enterprise-grade ecommerce intelligence platform designed to eliminate the manual complexity of modern dropshipping. It bridges market research, inventory synchronization, AI advertising copy generation, multi-account social media dispatch, and autonomous order fulfillment into a unified operating system.

### Key Capabilities

- **Research Radar**: Continuously analyzes global supplier catalogs (AliExpress, CJ Dropshipping, Zendrop, Spocket) to uncover high-margin products with high demand and low competition.
- **Autonomous DropAI Brain**: An intelligent execution layer operating under strict permission tiers (\`READ\`, \`WRITE\`, and interactive \`HIGH RISK\` confirmation) to audit stores, draft listings, and optimize pricing.
- **Store Bridge (OAuth 2.0 PKCE)**: Secure, cryptographic integration with Shopify, WooCommerce, and custom webhooks without sharing raw API secrets.
- **Creative Studio & Social Dispatch**: Real-time generative AI ad copy paired with 1-click publishing to connected Instagram, TikTok, Facebook, YouTube, X, and Pinterest accounts.
- **Multi-Tenant Data Isolation**: Complete tenancy boundaries enforced at the PostgreSQL database and cryptographic JWT edge layers.

> [!NOTE]
> DropAI operates on a non-custodial model: your customer payment processing remains directly with your Shopify Payments or Stripe accounts. DropAI never holds your customer revenue.
`,
  },
  {
    slug: "creating-and-securing-your-dropai-account",
    title: "Creating and securing your DropAI account",
    description: "Step-by-step instructions on registration, password complexity requirements, email verification, and two-factor authentication.",
    category: "getting-started",
    subcategory: "Account Setup",
    tags: "account, security, password, 2fa, registration",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Account Setup & Security

Setting up a merchant account on DropAI establishes a dedicated tenant database partition where all your products, orders, customers, and store integrations remain strictly isolated.

### Step 1: Sign Up
1. Navigate to [/auth/signup](/auth/signup).
2. Enter your business name, primary email address, and a secure password.
3. Passwords must be at least **8 characters** and include an uppercase letter, lowercase letter, number, and special character.
4. Alternatively, select **Continue with Google** for 1-click federated authentication.

### Step 2: Enable Two-Factor Authentication (TOTP)
1. Go to **Security Center** in your sidebar or visit [/app/security](/app/security).
2. Click **Enable 2FA (Authenticator App)**.
3. Scan the generated QR code using Google Authenticator, Authy, or 1Password.
4. Input the 6-digit TOTP code to verify.
5. **Crucial**: Copy and store your backup recovery codes in a secure password manager.

> [!WARNING]
> If you lose access to your authenticator device and do not have your backup recovery codes, you will need to contact DropAI Platform Administration with identity verification to initiate emergency account recovery.
`,
  },
  {
    slug: "setting-up-your-first-store",
    title: "Setting up your first store",
    description: "Configure your initial store entity, set target regional markets, and choose between Shopify, WooCommerce, or Custom bridges.",
    category: "getting-started",
    subcategory: "Store Configuration",
    tags: "store, setup, platform, shopify, woocommerce",
    readingTime: "4 min read",
    sortOrder: 3,
    featured: false,
    visibility: "PUBLIC",
    content: `## Setting Up Your First Store

Your DropAI workspace can manage multiple storefronts simultaneously. Each store contains independent currency settings, shipping profiles, and product catalogs.

### Step-by-Step Configuration

1. From the navigation sidebar, select **Operations > Stores** or visit [/app/stores](/app/stores).
2. Click the **+ Add Store** button in the top right corner.
3. Configure the store parameters:
   - **Store Name**: Internal display name (e.g., "Apex Living USA").
   - **Platform**: Select *Shopify (Official App Bridge)*, *WooCommerce REST v3*, or *Custom Webhook*.
   - **Store Domain**: Enter your \`.myshopify.com\` domain (e.g., \`https://apex-living.myshopify.com\`).
   - **Primary Currency**: Base currency for catalog operations (Default: USD).
   - **Country Target**: Default fulfillment destination (e.g., United States - US).
4. Click **Connect Store** to proceed to the OAuth handshake.
`,
  },
  {
    slug: "connecting-shopify-using-official-oauth-pkce",
    title: "Connecting Shopify using official OAuth PKCE",
    description: "How DropAI establishes cryptographic, passwordless connections to Shopify using the official OAuth 2.0 PKCE flow.",
    category: "getting-started",
    subcategory: "Integrations",
    tags: "shopify, oauth, pkce, app bridge, api",
    readingTime: "6 min read",
    sortOrder: 4,
    featured: true,
    visibility: "PUBLIC",
    content: `## Connecting Shopify via Official OAuth 2.0 PKCE

DropAI integrates with Shopify using the modern Proof Key for Code Exchange (PKCE) OAuth 2.0 standard. You never share your Shopify admin password or private API credentials.

### Authentication Flow

\`\`\`
DropAI Dashboard ──(1. Install Request)──> Shopify Admin Consent
       │                                         │
       ▼                                         ▼
Code Challenge & Verifier <──(2. Authorization)── User Approves Scopes
       │                                         │
       ▼                                         ▼
DropAI Engine <──(3. Exchange Token)───── Signed Access Token
\`\`\`

### Step-by-Step Instructions

1. Open **Platform > Integrations** or navigate to [/app/integrations](/app/integrations).
2. Locate the **Shopify** card and click **Connect**.
3. Input your exact \`myshopify.com\` URL (for example: \`my-brand.myshopify.com\`).
4. Click **Authenticate with Shopify**. You will be securely redirected to the official Shopify Admin consent screen.
5. Review the requested permissions and click **Install App**.
6. Shopify will cryptographically redirect back to DropAI, establishing a persistent webhook connection.

> [!NOTE]
> All inbound Shopify webhooks (\`orders/create\`, \`products/update\`, \`inventory_levels/update\`) are verified on our edge servers using HMAC-SHA256 signatures before being queued for ingestion.
`,
  },
  {
    slug: "understanding-shopify-permissions",
    title: "Understanding Shopify permissions",
    description: "Detailed breakdown of every permission scope requested during the Shopify OAuth installation and why it is required.",
    category: "getting-started",
    subcategory: "Integrations",
    tags: "shopify, permissions, scopes, security, privacy",
    readingTime: "4 min read",
    sortOrder: 5,
    featured: false,
    visibility: "PUBLIC",
    content: `## Required Shopify Permission Scopes

When connecting your Shopify store, DropAI requests the minimum necessary permissions required to sync products, manage inventory, and fulfill customer orders.

### Scope Breakdown

| Scope | Access Level | Purpose |
|---|---|---|
| \`read_products\`, \`write_products\` | Read & Write | Required to publish winning products from Research Radar and synchronize prices/descriptions. |
| \`read_inventory\`, \`write_inventory\` | Read & Write | Automatically decrements or updates stock counts when supplier warehouse levels change. |
| \`read_orders\`, \`write_orders\` | Read & Write | Ingests new customer orders for automated fraud analysis and supplier routing. |
| \`write_fulfillments\` | Write Only | Pushes carrier tracking numbers (USPS, YunExpress, DHL) and marks orders as fulfilled in Shopify. |
| \`read_shipping\` | Read Only | Reads configured shipping zones to calculate accurate landed product margins. |

> [!IMPORTANT]
> DropAI **never** requests or stores customer credit card details, banking credentials, or store payout information. All payment processing remains under Shopify Payments PCI-DSS Level 1 compliance.
`,
  },
  {
    slug: "configuring-base-currency-vs-display-currency",
    title: "Configuring base currency vs display currency",
    description: "Understand the critical distinction between DropAI's internal USD base currency ledger and client-side display currency conversion.",
    category: "getting-started",
    subcategory: "Currency & Finance",
    tags: "currency, usd, conversion, display, exchange rate",
    readingTime: "4 min read",
    sortOrder: 6,
    featured: false,
    visibility: "PUBLIC",
    content: `## Base Currency vs. Display Currency

To prevent floating-point rounding errors and multi-currency drift across supplier invoices, DropAI maintains a strict separation between **Base Currency** and **Display Currency**.

### 1. Base Currency (System Ledger)
- **Always USD ($)**: All product cost prices, supplier unit costs, shipping expenses, and database records (\`Product.costPrice\`, \`Order.totalAmount\`, \`Order.profitAmount\`) are stored in United States Dollars.
- Ensures consistent reporting across international suppliers who quote exclusively in USD.

### 2. Display Currency (Client-Side Rendering)
- Handled dynamically in your browser via the \`useCurrency()\` context.
- Supported display currencies: **USD ($), EUR (€), GBP (£), INR (₹), AED (د.إ), JPY (¥), CAD (CA$), AUD (AU$)**.
- When you toggle your display currency in the navigation bar, prices across the dashboard are converted in real-time using fixed reference exchange rates stored in \`lib/currency.ts\`.

> [!NOTE]
> Changing your display currency alters how figures are presented on your screen. It does not re-write underlying database monetary records or change what your Shopify store charges customers.
`,
  },
  {
    slug: "setting-your-country-and-shipping-profile",
    title: "Setting your country and shipping profile",
    description: "Configure default destination countries, carrier delivery velocity expectations, and supplier shipping profiles.",
    category: "getting-started",
    subcategory: "Shipping & Logistics",
    tags: "shipping, country, profile, logistics, carriers",
    readingTime: "5 min read",
    sortOrder: 7,
    featured: false,
    visibility: "PUBLIC",
    content: `## Setting Country & Shipping Profiles

Shipping profiles determine landed cost estimates in Research Radar and automate carrier assignments during order fulfillment.

### Configuration Steps

1. Navigate to **Operations > Shipping** in the sidebar or visit [/app/shipping](/app/shipping).
2. Configure **Primary Target Country**:
   - Default: United States (US).
   - DropAI cross-references supplier transit times specifically for your designated target region.
3. Configure **Carrier Tiers**:
   - **Tier 1 (Express)**: DHL Express, FedEx Priority (3-5 business days).
   - **Tier 2 (Standard Line)**: YunExpress, USPS Priority, ePacket (7-12 business days).
   - **Tier 3 (Economy)**: Standard Postal Lines (14-21 business days).
4. Define your **Default Free Shipping Threshold** (e.g., Free shipping on orders over $50).
`,
  },
  {
    slug: "importing-your-first-product-from-research-radar",
    title: "Importing your first product from Research Radar",
    description: "How to use AI Product Discovery, evaluate trend and margin scores, and import a winning product directly into your catalog.",
    category: "getting-started",
    subcategory: "Product Discovery",
    tags: "radar, import, product, ai score, margin",
    readingTime: "5 min read",
    sortOrder: 8,
    featured: true,
    visibility: "PUBLIC",
    content: `## Sourcing Winning Products via Research Radar

DropAI's **Product Research Radar** aggregates live product metrics across leading ecommerce marketplaces and wholesale supplier databases.

### Evaluating Product Scores

Every product on the Radar carries 5 proprietary analytical scores:
1. **AI Score (Overall)**: Weighted composite of market profitability and velocity.
2. **Demand Score**: Search volume growth, social media mentions, and sales frequency.
3. **Competition Score**: Number of active stores advertising the item (lower is better).
4. **Margin Score**: Disparity between supplier cost and real market retail price.
5. **Trend Score**: 30-day Google Trends and TikTok Creative Center growth trajectory.

### Step-by-Step Import

1. Navigate to **Operations > Product Research** or visit [/app/product-research](/app/product-research).
2. Use the category filters or search bar to identify high-margin items (e.g., margin > 60%).
3. Click on any product card to inspect supplier variants, delivery estimates, and historical sell prices.
4. Click **Import Product**.
5. The product is immediately created in your DropAI database under \`Product\` and synced to your connected store in \`DRAFT\` status for your final review.
`,
  },
  {
    slug: "launching-your-first-product",
    title: "Launching your first product",
    description: "Reviewing profit margins, customizing AI-optimized titles and descriptions, and publishing your product live to Shopify.",
    category: "getting-started",
    subcategory: "Product Catalog",
    tags: "launch, publish, shopify, description, pricing",
    readingTime: "4 min read",
    sortOrder: 9,
    featured: false,
    visibility: "PUBLIC",
    content: `## Launching Your First Product

After importing a product from Research Radar, you should optimize its listing before making it active for shoppers.

### Pre-Launch Checklist

1. Open **Operations > Products** or navigate to [/app/products](/app/products).
2. Click on the newly imported draft product.
3. **Set Retail Price & Margin**: Verify the \`sellingPrice\` compared to the \`costPrice\`. DropAI automatically suggests a 2.5x to 3x markup for optimal advertising budget coverage.
4. **AI Description Polish**: Click **Polish with AI** to generate customer-centric benefit bullets, technical specifications, and FAQ sections.
5. **Image Selection**: Reorder product gallery images; place lifestyle and high-resolution white-background shots first.
6. **Set Status to ACTIVE**: Toggle the status dropdown from \`DRAFT\` to \`ACTIVE\`.
7. Click **Sync to Shopify**. The listing is pushed live to your storefront in real time.
`,
  },
  {
    slug: "understanding-the-dropai-brain",
    title: "Understanding the DropAI Brain",
    description: "Architecture, autonomous reasoning, and safety guardrails behind the DropAI ecommerce intelligence engine.",
    category: "getting-started",
    subcategory: "AI & Intelligence",
    tags: "brain, ai, architecture, agent, automation",
    readingTime: "6 min read",
    sortOrder: 10,
    featured: true,
    visibility: "PUBLIC",
    content: `## DropAI Brain Architecture

The **DropAI Brain** is the autonomous reasoning engine that powers chat assistance, automated store audits, competitor price intelligence, and ad copy generation.

### How the Brain Works

1. **Context Ingestion**: When you ask a question or initiate an automation, the Brain reads real-time store metrics (revenue, orders, product margins, supplier inventory).
2. **Universal AI Client**: DropAI routes requests through an enterprise multi-model orchestrator (\`lib/ai/universal-client.ts\`). The default active provider is Google Gemini 3.6 Flash, with automated failover to OpenAI or Anthropic Claude.
3. **Structured Tool Calls**: Rather than generating unstructured text, the Brain executes deterministic tools from \`APPROVED_AI_TOOLS\` (such as \`get_store_analytics\` or \`search_winning_products\`).
4. **Audit Logging**: Every single AI request, token consumption, latency metric, and output is permanently recorded in the Neon database table \`AiRequest\`.
`,
  },
  {
    slug: "understanding-ai-tool-permissions",
    title: "Understanding AI tool permissions",
    description: "Detailed guide to the 3-tier security model: READ tools, WRITE tools, and HIGH RISK actions requiring explicit user confirmation.",
    category: "getting-started",
    subcategory: "AI & Intelligence",
    tags: "permissions, brain, security, tools, read write",
    readingTime: "5 min read",
    sortOrder: 11,
    featured: false,
    visibility: "PUBLIC",
    content: `## The 3-Tier AI Permission Model

To guarantee that artificial intelligence can never cause unintended financial loss or catalog damage, DropAI enforces a strict 3-tier permission hierarchy:

### Tier 1: READ Tools (Autonomous Execution)
- **Tools**: \`get_store_analytics\`, \`search_winning_products\`, \`find_supplier_alternatives\`.
- **Behavior**: The AI executes these immediately without prompting. They only query data and perform zero mutations.

### Tier 2: WRITE Tools (Staged Execution)
- **Tools**: \`draft_product_listing\`, \`generate_ad_copy\`.
- **Behavior**: The AI can create draft listings or generate ad hooks. However, they are created in \`DRAFT\` status and never made visible to end shoppers without your manual activation.

### Tier 3: HIGH_RISK Tools (Mandatory User Approval)
- **Tools**: \`cancel_order\`, \`delete_product\`, \`publish_ad_campaign\`.
- **Behavior**: The AI **cannot** execute these autonomously. It renders an interactive confirmation modal showing the exact action payload, financial impact, and consequences. You must explicitly click **Confirm Action** to proceed.

> [!WARNING]
> No background worker or AI autonomous loop has permission to bypass the HIGH RISK confirmation gate.
`,
  },
  {
    slug: "completing-your-first-order-workflow",
    title: "Completing your first order workflow",
    description: "Walkthrough of an order from customer checkout in Shopify, automated fraud review, supplier dispatch, to tracking sync.",
    category: "getting-started",
    subcategory: "Fulfillment",
    tags: "orders, workflow, fulfillment, tracking, supplier",
    readingTime: "5 min read",
    sortOrder: 12,
    featured: false,
    visibility: "PUBLIC",
    content: `## First Order Fulfillment Workflow

Here is the complete end-to-end lifecycle when a customer purchases from your store:

1. **Webhook Ingestion**: Customer places an order on Shopify. Shopify sends an \`orders/create\` webhook. DropAI verifies the HMAC signature and creates an \`Order\` record.
2. **Automated Fraud Scoring**: The order is evaluated for risk (0-100 score). Orders below 30 are marked \`LOW RISK\`. Orders above 75 are automatically placed on \`HOLD\` for merchant review.
3. **Supplier Routing**: DropAI checks primary supplier inventory for the purchased variant. If in stock, an automated fulfillment request is transmitted.
4. **Tracking Generation**: When the supplier dispatches the parcel, a tracking number (USPS, YunExpress, DHL) is generated.
5. **Shopify & Customer Notification**: DropAI updates the order status to \`SHIPPED\` and pushes the tracking URL directly back to Shopify, which triggers your store's customer shipment notification email.
`,
  },
  {
    slug: "understanding-the-dropai-dashboard",
    title: "Understanding the DropAI dashboard",
    description: "Detailed guide to the real-time revenue cards, profit indicators, fulfillment radar, and quick action shortcuts.",
    category: "getting-started",
    subcategory: "Dashboard",
    tags: "dashboard, kpis, revenue, profit, analytics",
    readingTime: "4 min read",
    sortOrder: 13,
    featured: false,
    visibility: "PUBLIC",
    content: `## DropAI Dashboard Overview

The **Dashboard** ([/app/dashboard](/app/dashboard)) is your central operational command center.

### Core Metrics

- **Total Revenue**: Gross sales volume across all connected stores within the selected timeframe.
- **Net Profit**: Revenue minus Cost of Goods Sold (COGS), supplier shipping fees, and ad spend.
- **Total Orders**: Count of fulfilled and in-progress orders.
- **Conversion Rate**: Percentage of storefront visitors who complete a checkout.

### Action Panels

- **Operational Alerts**: Displays high-risk orders requiring clearance or low-inventory warnings.
- **Top Performing Products**: Ranks your active catalog by sales velocity and return on ad spend.
- **Recent Order Stream**: Live timeline of inbound customer purchases.
`,
  },

  // --- PRODUCT RESEARCH & AI ---
  {
    slug: "research-radar-scoring-guide",
    title: "Research Radar & Winning-Product Signals",
    description: "In-depth breakdown of the proprietary algorithmic scoring models used to identify trending, high-converting dropshipping products.",
    category: "product-research-ai",
    subcategory: "Market Intelligence",
    tags: "radar, scoring, demand, trend, competition",
    readingTime: "6 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Research Radar Algorithmic Signals

Research Radar evaluates thousands of products daily using five distinct scoring vectors:

### 1. Demand Score (0 - 100)
Measures consumer purchase intent using Google Search trends, Amazon BSR (Best Sellers Rank) changes, and social media viral velocity on TikTok and Instagram Reels.

### 2. Competition Score (0 - 100)
Analyzes how saturated the product is among competing dropshippers. A score below 40 represents an untapped blue-ocean opportunity.

### 3. Margin Score (0 - 100)
Calculates real-world profitability:
$$\\text{Margin} = \\frac{\\text{Selling Price} - (\\text{Supplier Unit Cost} + \\text{Shipping})}{\\text{Selling Price}} \\times 100$$
Products scoring above 70 consistently allow for profitable customer acquisition costs (CAC) on Meta and TikTok Ads.

### 4. Trend Score (0 - 100)
Tracks velocity of viral interest. High trend scores indicate products entering an exponential growth phase.
`,
  },
  {
    slug: "supplier-price-comparison",
    title: "Supplier Comparison & Profit/Margin Calculation",
    description: "How to compare wholesale suppliers, evaluate delivery reliability, and calculate accurate landed margins.",
    category: "product-research-ai",
    subcategory: "Suppliers",
    tags: "supplier, cost, profit, cogs, comparison",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Supplier Comparison Engine

DropAI cross-references each product across multiple verified dropshipping suppliers:

- **AliExpress Wholesale**
- **CJ Dropshipping**
- **Zendrop Verified**
- **Spocket US/EU Fast Dispatch**

### What to Compare

1. **Unit Cost**: Base manufacturer price per unit.
2. **Transit Times**: Air express vs postal line delivery speeds (e.g., 7-day YunExpress vs 20-day ePacket).
3. **Warehouse Location**: US/EU domestic warehouses offer faster delivery times and higher customer satisfaction.
4. **Stock Reliability**: Verified supplier warehouse counts prevent stock-outs during ad scaling.
`,
  },
  {
    slug: "ai-creative-studio-ad-generation",
    title: "AI-Generated Descriptions & Creative Studio",
    description: "How to generate viral ad hooks, persuasive copy, and 1-click auto-upload ads to connected brand social accounts.",
    category: "product-research-ai",
    subcategory: "Creative Studio",
    tags: "creative studio, ad copy, hooks, social media, upload",
    readingTime: "5 min read",
    sortOrder: 3,
    featured: true,
    visibility: "PUBLIC",
    content: `## AI Creative Studio & Social Media Auto-Upload

The **Creative Studio** ([/app/creative-studio](/app/creative-studio)) leverages Google Gemini 3.6 Flash to generate high-converting advertising creatives tailored to specific social platforms.

### Ad Generation Workflow

1. Select a product from your catalog or Research Radar.
2. Choose your target ad platform: **Meta (Facebook/Instagram), TikTok, or Google Ads**.
3. Select your campaign objective: *Cold Acquisition*, *Problem-Agitation-Solution*, or *Social Proof / FOMO*.
4. Click **Generate Creative Package**.
5. The AI returns 3 viral hooks, primary ad body copy, and high-CTR calls to action.

### 🚀 1-Click Auto-Upload to Social Accounts

Connect your brand social media accounts under [/app/social-accounts](/app/social-accounts) (Instagram, TikTok, Facebook, YouTube, X, Pinterest, LinkedIn). When an ad is generated, click **Auto-Upload to Social Accounts**, select your target brand channels, and DropAI instantly dispatches the ad creative directly via official webhooks and APIs.
`,
  },
  {
    slug: "ai-actions-approval-history",
    title: "Approving/Rejecting AI Actions & History",
    description: "Reviewing the DropAI Brain action log, inspecting model reasoning, and managing interactive approvals.",
    category: "product-research-ai",
    subcategory: "AI Management",
    tags: "audit, history, approvals, ai actions, log",
    readingTime: "4 min read",
    sortOrder: 4,
    featured: false,
    visibility: "PUBLIC",
    content: `## AI Action Logs & Approval Gates

Every action proposed or taken by the AI Brain is audited in real-time.

### Reviewing Action Logs

1. Open **Growth & Intelligence > AI Assistant** ([/app/ai-assistant](/app/ai-assistant)).
2. Expand the **Activity & Tool Calls** panel on the right sidebar.
3. Inspect:
   - Tool executed (e.g. \`get_store_analytics\`)
   - Latency and tokens used
   - Parameters passed
   - Raw output data
4. For any staged \`HIGH RISK\` action, review the proposed change and select either **Approve & Execute** or **Reject Proposal**.
`,
  },

  // --- SHOPIFY & STORE INTEGRATIONS ---
  {
    slug: "shopify-oauth-pkce-deep-dive",
    title: "Shopify OAuth PKCE Connection & Security",
    description: "Technical architecture of DropAI's official Shopify App Bridge, PKCE verification, and token encryption.",
    category: "shopify-integrations",
    subcategory: "Architecture",
    tags: "shopify, oauth, pkce, token, encryption",
    readingTime: "6 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Shopify OAuth PKCE Architecture

DropAI adheres strictly to Shopify's modern App Store and Partner security guidelines by implementing OAuth 2.0 with Proof Key for Code Exchange (PKCE).

### Security Architecture

- **No Shared Secrets**: The client generates a high-entropy cryptographic \`code_verifier\` and derives a SHA-256 \`code_challenge\`.
- **Token Encryption**: Received access tokens are encrypted at rest using AES-256-GCM before storage in our PostgreSQL database.
- **Tenant Scope Isolation**: Every token is tied strictly to your merchant user ID (\`Store.userId\`).
`,
  },
  {
    slug: "shopify-bidirectional-synchronization",
    title: "Product, Inventory, Price & Order Synchronization",
    description: "How DropAI maintains real-time bidirectional synchronization with your Shopify catalog, stock levels, and customer orders.",
    category: "shopify-integrations",
    subcategory: "Catalog Sync",
    tags: "sync, inventory, price, orders, catalog",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Bidirectional Synchronization

DropAI ensures your Shopify store and backend supplier data remain in perfect alignment:

### 1. Inbound Sync (Shopify ➔ DropAI)
- **New Orders**: Ingested within 500ms of checkout via webhook.
- **Customer Details**: Shipping addresses parsed and validated.
- **Refund Events**: Automatically cancels downstream supplier fulfillment if an order is refunded in Shopify before dispatch.

### 2. Outbound Sync (DropAI ➔ Shopify)
- **Product Publishing**: Drafts pushed to Shopify with tags, collections, images, and HTML descriptions.
- **Price Rules**: Automated price margin updates pushed to Shopify variants.
- **Fulfillment & Tracking**: Carrier tracking numbers pushed with direct customer tracking URLs.
`,
  },
  {
    slug: "shopify-webhooks-and-reauthorization",
    title: "Webhooks, Failure Recovery & Reauthorization",
    description: "Understanding webhook health, handling network drops, and safely reauthorizing disconnected Shopify stores.",
    category: "shopify-integrations",
    subcategory: "Webhooks",
    tags: "webhooks, hmac, reauthorization, retry, recovery",
    readingTime: "5 min read",
    sortOrder: 3,
    featured: false,
    visibility: "PUBLIC",
    content: `## Webhooks & Fault Tolerance

DropAI registers the following essential Shopify webhooks upon connection:
- \`orders/create\`
- \`orders/cancelled\`
- \`products/update\`
- \`inventory_levels/update\`
- \`app/uninstalled\`

### Failure Recovery & Idempotency

All inbound payloads are processed with **idempotent keys** (\`idempotencyKey = order.id + "_" + order.updated_at\`). If Shopify retries an event, DropAI recognizes the duplicate and avoids double-processing or charging suppliers twice.

### Reauthorizing a Disconnected Store
If your Shopify credentials expire or you change your primary store URL:
1. Navigate to **Operations > Stores** ([/app/stores](/app/stores)).
2. Locate the store marked \`DISCONNECTED\` or \`ERROR\`.
3. Click **Re-Authorize**. This triggers a fresh OAuth handshake without deleting existing product links or order history.
`,
  },

  // --- AUTOMATIONS & FULFILLMENT ---
  {
    slug: "supplier-auto-fallback-inventory",
    title: "Low Inventory Supplier Auto-Fallback & Priority",
    description: "Configure automated multi-supplier fallback rules so orders never fail when a primary warehouse runs out of stock.",
    category: "automations-fulfillment",
    subcategory: "Fulfillment Rules",
    tags: "automation, supplier fallback, inventory, stockout",
    readingTime: "5 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Supplier Auto-Fallback Automation

Stock-outs during ad scaling can devastate fulfillment times. DropAI's **Supplier Priority Engine** automatically routes orders to secondary verified suppliers when primary inventory falls below your threshold.

### Automation Logic

\`\`\`
Trigger: Order Ingested
Condition: Primary Supplier Stock < 10 Units
Action: Switch Fulfillment Route to Secondary Priority Supplier
Approval: Autonomous (if unit cost difference <= $2.00)
Result: Order Dispatched with Zero Delay
\`\`\`

### Configuring Supplier Priority

1. Go to **Operations > Automations** or visit [/app/automations](/app/automations).
2. Click **Create Automation** and select template **Low Inventory Supplier Fallback**.
3. Set your threshold (e.g. Stock < 25 units).
4. Assign backup suppliers for the target SKU.
`,
  },
  {
    slug: "fraud-risk-scoring-holds",
    title: "Fraud-Risk Scoring & Automated Order Holds",
    description: "How DropAI's AI fraud engine scores inbound customer orders and automatically places high-risk checkouts on hold.",
    category: "automations-fulfillment",
    subcategory: "Risk Management",
    tags: "fraud, risk, hold, security, chargeback",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Automated Fraud-Risk Holds

Chargebacks and fraudulent orders damage merchant standing with payment processors. DropAI evaluates every transaction using a multi-factor risk scoring algorithm (0 - 100):

- IP geolocation vs billing address country mismatch
- Disposable or burner email domain detection
- High-velocity repeat order attempts from same card fingerprint
- Proxy, Tor, or VPN exit node connection

### Risk Thresholds

- **0 - 30 (LOW)**: Automatically cleared for immediate supplier fulfillment.
- **31 - 74 (MEDIUM)**: Processed with secondary address verification.
- **75 - 100 (HIGH)**: **Automatically Placed on HOLD**. A notification is generated in your dashboard. You must manually click **Clear & Fulfill** or **Cancel & Refund**.
`,
  },
  {
    slug: "carrier-tracking-synchronization",
    title: "Carrier Tracking Sync (USPS, YunExpress, DHL)",
    description: "Supported shipping lines, milestone event tracking, and customer tracking URL synchronization.",
    category: "automations-fulfillment",
    subcategory: "Logistics",
    tags: "tracking, usps, yunexpress, dhl, carriers",
    readingTime: "4 min read",
    sortOrder: 3,
    featured: false,
    visibility: "PUBLIC",
    content: `## Carrier Tracking Synchronization

DropAI monitors parcel transit milestones across all major international and domestic carriers:

### Supported Carrier Lines
- **USPS**: Domestic US delivery, final-mile tracking.
- **YunExpress**: Dedicated international cross-border lines with pre-cleared customs.
- **DHL Express**: Global expedited air express (3-5 days).
- **FedEx / ePacket**: Standard domestic and international services.

### Milestone Status Codes
- \`LABEL_CREATED\`: Supplier has booked dispatch and generated tracking code.
- \`IN_TRANSIT\`: Parcel has departed airline terminal or transit hub.
- \`OUT_FOR_DELIVERY\`: Local postal carrier has loaded package for delivery.
- \`DELIVERED\`: Final doorstep delivery confirmed.
- \`EXCEPTION\`: Delivery attempted, incorrect address, or customs clearance required.
`,
  },
  {
    slug: "returns-refunds-and-disputes",
    title: "Returns, Partial Returns, Refunds & Supplier Disputes",
    description: "Handling customer returns, processing partial refunds, and opening dispute cases with wholesale suppliers.",
    category: "automations-fulfillment",
    subcategory: "Disputes",
    tags: "returns, refunds, disputes, customer service",
    readingTime: "5 min read",
    sortOrder: 4,
    featured: false,
    visibility: "PUBLIC",
    content: `## Returns, Refunds & Supplier Disputes

When a customer reports a damaged parcel or requests a return, DropAI streamlines resolution:

### 1. Partial & Full Refunds
- Process refunds directly inside **Orders > Order Detail** ([/app/orders](/app/orders)).
- Selecting **Refund Order** notifies Shopify Payments to credit the customer's card and records a negative financial event in your profit ledger.

### 2. Supplier Disputes
- If a parcel is lost in transit (exceeding carrier transit guarantee), click **Open Supplier Dispute**.
- DropAI packages the tracking timeline, customer statement, and shipment photos to submit a claim for supplier reimbursement or reshipment.
`,
  },

  // --- ORDERS & LIFECYCLE ---
  {
    slug: "complete-order-lifecycle-guide",
    title: "Complete Order Lifecycle State Machine",
    description: "Understanding every state an order traverses from checkout to final delivery or refund.",
    category: "orders",
    subcategory: "Order Management",
    tags: "order, lifecycle, state machine, status, timeline",
    readingTime: "5 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## The Order Lifecycle State Machine

Every order in DropAI transitions through deterministic statuses:

\`\`\`
[1. PENDING] ──(Payment Captured)──> [2. PAID]
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            (Fraud Score >= 75)                        (Fraud Score < 75)
                     │                                         │
              [3. ON HOLD]                              [4. PROCESSING]
                     │                                         │
              (Merchant Clears)                        (Supplier Confirms)
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          ▼
                                   [5. SHIPPED]
                                          │
                               (Tracking Delivered)
                                          ▼
                                  [6. DELIVERED]
\`\`\`

### Status Meanings
- **PENDING**: Checkout started; waiting for gateway webhook.
- **PAID**: Funds captured; queued for fraud evaluation.
- **PROCESSING**: Supplier has accepted line items and is packaging.
- **SHIPPED**: Carrier tracking number assigned and synced to Shopify.
- **DELIVERED**: Final milestone reached.
`,
  },
  {
    slug: "order-timeline-activity-history",
    title: "Order Timeline, Tracking & Failure Handling",
    description: "How to inspect granular order events, debug fulfillment failures, and manually re-dispatch orders.",
    category: "orders",
    subcategory: "Order Detail",
    tags: "order detail, timeline, activity, retry, failure",
    readingTime: "4 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Inspecting Order Timelines

The **Order Details** screen ([/app/orders/[id]](/app/orders)) provides an immutable audit log of every event that occurred on a customer purchase:

- Exact timestamp of webhook receipt
- Fraud score calculation breakdown
- Supplier confirmation ID and invoice number
- Carrier tracking milestones and GPS location updates

### Resolving Failed Fulfillment
If a supplier rejects an order (e.g., due to an invalid shipping postal code or out-of-stock variant):
1. The order status updates to \`EXCEPTION\`.
2. Click **Edit Shipping Address** to correct typos.
3. Click **Re-Dispatch to Supplier** to retry execution immediately.
`,
  },

  // --- PAYMENTS, CURRENCY & PROFIT ---
  {
    slug: "currency-architecture-conversion",
    title: "Base Currency vs Display Currency & Real Conversion",
    description: "Deep dive into how DropAI maintains mathematical consistency across currencies and handles exchange rates.",
    category: "payments-currency",
    subcategory: "Currency",
    tags: "currency, exchange rates, usd, conversion, decimals",
    readingTime: "5 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Currency Architecture Deep Dive

DropAI uses a single reference currency model to guarantee ledger consistency:

### 1. USD Base System
All financial calculations (COGS, gross revenue, supplier costs, net profit) are calculated and persisted strictly in **USD ($)**. This prevents multi-currency conversion rounding issues when auditing monthly financial performance.

### 2. Live Display Conversion Table
Display conversion uses standard reference rates stored in \`lib/currency.ts\`:
- **USD**: 1.00 ($)
- **EUR**: 0.92 (€)
- **GBP**: 0.78 (£)
- **INR**: 83.50 (₹)
- **AED**: 3.67 (د.إ)
- **JPY**: 154.20 (¥)
- **CAD**: 1.36 (CA$)
- **AUD**: 1.52 (AU$)

> [!NOTE]
> Display currencies maintain appropriate decimal formatting (e.g. 0 decimals for JPY, 2 decimals for USD/EUR).
`,
  },
  {
    slug: "profit-margins-and-cogs",
    title: "Gross Profit, Net Profit & COGS Calculation",
    description: "How DropAI computes true net margins by deducting cost of goods, shipping, platform fees, and ad spend.",
    category: "payments-currency",
    subcategory: "Profit Metrics",
    tags: "profit, net profit, gross profit, cogs, margins",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Profit & Margin Computation

DropAI calculates true profitability rather than vanity revenue figures:

### Formula
$$\\text{Net Profit} = \\text{Gross Revenue} - (\\text{COGS} + \\text{Supplier Shipping} + \\text{Payment Fees} + \\text{Ad Spend})$$

- **COGS (Cost of Goods Sold)**: Direct unit cost charged by the manufacturer.
- **Supplier Shipping**: Landed freight cost to deliver the parcel to the customer.
- **Payment Processing Fees**: Estimated at standard 2.9% + $0.30 per transaction.
- **Ad Spend**: Ingested directly from connected Meta, TikTok, or Google Ads campaigns.
`,
  },

  // --- SECURITY & ACCOUNT ---
  {
    slug: "two-factor-authentication-totp",
    title: "2FA, TOTP & Google Authenticator Setup",
    description: "Setting up time-based one-time passwords (TOTP), generating backup recovery codes, and emergency resets.",
    category: "security-account",
    subcategory: "Authentication",
    tags: "2fa, totp, authenticator, recovery codes, security",
    readingTime: "5 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Two-Factor Authentication (TOTP)

Protecting your store from unauthorized access requires multi-factor authentication. DropAI supports standard RFC 6238 TOTP authenticators:

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password / Bitwarden

### Enabling 2FA
1. Open **Platform > Security Center** ([/app/security](/app/security)).
2. Under **Two-Factor Authentication**, click **Setup Authenticator**.
3. Scan the QR code or enter the secret key manually.
4. Input the current 6-digit code to activate.
5. Save your **Emergency Recovery Codes** in an encrypted vault.
`,
  },
  {
    slug: "sessions-device-management",
    title: "Active Sessions & Remote Device Revocation",
    description: "Review active desktop and mobile login sessions, inspect IP geolocations, and revoke suspicious devices.",
    category: "security-account",
    subcategory: "Sessions",
    tags: "sessions, devices, ip address, revoke, logout",
    readingTime: "4 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Active Sessions & Device Security

DropAI monitors every browser session connected to your account:

- **Device & Browser Type**: Chrome on Windows, Safari on iOS, etc.
- **IP Address & Geolocation**: City and country of the connection.
- **Last Active Timestamp**: Real-time heartbeat tracking.

### Revoking a Session
If you notice an unrecognized location:
1. Navigate to **Platform > Security Center** ([/app/security](/app/security)).
2. Under **Active Sessions**, locate the target device card.
3. Click **Revoke Session**. The device's session token is invalidated immediately in the database and edge middleware.
`,
  },
  {
    slug: "multi-tenant-data-isolation",
    title: "Multi-Tenant Data Isolation & API Security",
    description: "How DropAI guarantees complete data isolation between merchants at the database and API authorization layers.",
    category: "security-account",
    subcategory: "Data Privacy",
    tags: "multi-tenant, isolation, tenancy, jwt, postgresql",
    readingTime: "5 min read",
    sortOrder: 3,
    featured: false,
    visibility: "PUBLIC",
    content: `## Multi-Tenant Data Isolation

In DropAI, data isolation is enforced at every layer of the architecture:

### 1. Database Partitioning
Every entity (\`Product\`, \`Order\`, \`Store\`, \`Customer\`, \`Automation\`, \`SocialAccount\`) contains a mandatory \`userId\` foreign key linked directly to your authenticated user account.

### 2. Edge Middleware Verification
Our Next.js edge middleware cryptographically verifies the \`dropai_session_token\` JWT signature. Unauthenticated requests are rejected before ever reaching application code.

### 3. Server-Side Guard
All server actions and API routes filter by \`where: { userId: currentUser.id }\`. A merchant can never access or query another store's products, customer addresses, or revenue data.
`,
  },

  // --- TROUBLESHOOTING CENTER ---
  {
    slug: "troubleshoot-shopify-oauth-failed",
    title: "Problem: Shopify Won't Connect / OAuth Failed",
    description: "Troubleshooting guide for OAuth redirect errors, invalid domain formats, and permissions rejection in Shopify.",
    category: "troubleshooting",
    subcategory: "Integrations",
    tags: "troubleshooting, shopify, oauth error, connection failed",
    readingTime: "5 min read",
    sortOrder: 1,
    featured: true,
    visibility: "PUBLIC",
    content: `## Problem: Shopify Won't Connect or OAuth Fails

### Possible Causes
1. Typos in your \`.myshopify.com\` domain URL (e.g. entering your custom domain instead of the original myshopify handle).
2. The user attempting installation is not a Shopify Store Owner or does not have app installation privileges.
3. Browser pop-up blocker or third-party cookie restrictions interfering with the OAuth handshake.

### How to Check
- Ensure your input matches: \`your-store-name.myshopify.com\`.
- Check if you are logged into your Shopify admin in another tab before clicking **Connect**.

### Solution
1. Clear browser cookies for \`myshopify.com\` and \`dropai.io\`.
2. Disable ad-blockers or Brave Shields for the OAuth authorization redirect.
3. Log in directly as the Shopify Account Owner and retry the connection under [/app/stores](/app/stores).
`,
  },
  {
    slug: "troubleshoot-products-inventory-not-syncing",
    title: "Problem: Products or Inventory Not Syncing",
    description: "Diagnosing catalog synchronization failures, missing variants, and out-of-sync inventory counts.",
    category: "troubleshooting",
    subcategory: "Catalog",
    tags: "troubleshooting, inventory, product sync, variants",
    readingTime: "4 min read",
    sortOrder: 2,
    featured: false,
    visibility: "PUBLIC",
    content: `## Problem: Products or Inventory Not Syncing

### Possible Causes
- The product was created in DropAI but has \`status: DRAFT\`.
- Shopify API rate limit reached temporarily during bulk catalog imports.
- Missing SKU mapping between supplier variant and Shopify variant ID.

### Solution
1. Open the product in **Operations > Products** ([/app/products](/app/products)).
2. Verify the status is set to **ACTIVE**.
3. Click the **Force Sync to Shopify** button to push an immediate update.
4. Verify the product appears in your Shopify Admin under **Products**.
`,
  },
  {
    slug: "troubleshoot-ai-actions-failed",
    title: "Problem: AI Action Failed or Automation Did Not Run",
    description: "Resolving AI generation timeouts, quota exhaustion, and automation trigger evaluation issues.",
    category: "troubleshooting",
    subcategory: "AI Engine",
    tags: "troubleshooting, ai error, timeout, automation failed",
    readingTime: "4 min read",
    sortOrder: 3,
    featured: false,
    visibility: "PUBLIC",
    content: `## Problem: AI Action Failed or Automation Stalled

### Possible Causes
- Upstream AI provider latency spike or temporary quota limit.
- Missing required parameters for the tool (e.g. missing target country or SKU).
- Automation trigger conditions were not met (e.g. order fraud score was below the hold threshold).

### Solution
1. DropAI features automatic provider cascading: if OpenAI quotas are exhausted, our orchestrator immediately falls back to Google Gemini 3.6 Flash.
2. In Creative Studio, ensure you have selected a valid product with title and category.
3. In **Automations**, click on the automation card and review **Run History** to view the exact JSON trigger payload and reason for evaluation.
`,
  },
  {
    slug: "troubleshoot-login-and-2fa-issues",
    title: "Problem: Login Failure, 2FA Issue or Session Expired",
    description: "Solutions for invalid credentials, lost authenticator apps, and session expiration loops.",
    category: "troubleshooting",
    subcategory: "Access & Auth",
    tags: "troubleshooting, login, 2fa, session expired, password",
    readingTime: "5 min read",
    sortOrder: 4,
    featured: false,
    visibility: "PUBLIC",
    content: `## Problem: Login Failure or 2FA Lockout

### Possible Causes
- Account was registered with **Continue with Google**, but you are typing your password into the direct email form.
- Authenticator app time drift (TOTP codes depend on synchronized device time).
- Session cookie cleared or blocked by private browsing settings.

### Solution
1. **Google-Registered Accounts**: If you signed up with Google, click the **Continue with Google** button on the login screen.
2. **2FA Device Time Sync**: On your phone, go to Authenticator Settings > *Time correction for codes* > *Sync now*.
3. **Backup Recovery Codes**: If your phone was lost, use one of your stored 8-digit emergency recovery codes on the 2FA prompt.
`,
  },

  // --- DEVELOPER / TECHNICAL DOCUMENTATION (AUTHENTICATED) ---
  {
    slug: "developer-api-overview-and-auth",
    title: "Developer API Overview, Authentication & JWT Tokens",
    description: "Technical reference for integrating custom applications with DropAI's REST APIs using cryptographically signed JWTs.",
    category: "developer-api",
    subcategory: "API Reference",
    tags: "developer, api, rest, authentication, jwt, endpoints",
    readingTime: "7 min read",
    sortOrder: 1,
    featured: true,
    visibility: "AUTHENTICATED",
    content: `## DropAI REST API Overview

The DropAI API is built on RESTful principles with JSON payloads and standard HTTP response status codes.

### Authentication

All protected merchant requests must supply a valid \`dropai_session_token\` in an \`Authorization\` header or HTTP-only cookie:

\`\`\`http
GET /api/app/data?type=orders HTTP/1.1
Host: dropai.io
Authorization: Bearer <JWT_SESSION_TOKEN>
Accept: application/json
\`\`\`

### Standard Endpoints

| Endpoint | Method | Description |
|---|---|---|
| \`/api/app/data?type=products\` | GET | Returns merchant catalog with variant pricing. |
| \`/api/app/data\` | POST | Creates or updates products, stores, and automations. |
| \`/api/app/social-accounts\` | GET, POST, DELETE | Manages connected brand social channels. |
| \`/api/ai/creative-studio\` | POST | Generates ad copy and hooks using Gemini 3.6 Flash. |
| \`/api/ai/chat\` | POST | Interacts with DropAI Brain with structured tool execution. |
`,
  },
  {
    slug: "developer-webhooks-hmac-verification",
    title: "Webhooks & Cryptographic HMAC Verification",
    description: "Verifying inbound webhook signatures from DropAI, Shopify, and payment gateways using HMAC-SHA256.",
    category: "developer-api",
    subcategory: "Webhooks",
    tags: "webhooks, hmac, sha256, security, verification",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "AUTHENTICATED",
    content: `## Webhook HMAC-SHA256 Verification

To ensure webhooks originate authentically from DropAI, verify the cryptographic signature sent in the \`x-dropai-signature\` header:

### Node.js Verification Example

\`\`\`javascript
const crypto = require("crypto");

function verifyDropAiWebhook(rawBody, signatureHeader, secretKey) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(rawBody, "utf8");
  const calculatedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(calculatedSignature)
  );
}
\`\`\`
`,
  },
  {
    slug: "developer-multi-tenant-architecture",
    title: "Multi-Tenant Database Architecture & Rate Limits",
    description: "Detailed breakdown of the Prisma schema tenancy partitioning, connection pooling, and API rate limits.",
    category: "developer-api",
    subcategory: "Architecture",
    tags: "architecture, multi-tenant, prisma, database, rate limits",
    readingTime: "6 min read",
    sortOrder: 3,
    featured: false,
    visibility: "AUTHENTICATED",
    content: `## Multi-Tenant Database Architecture

DropAI utilizes Neon PostgreSQL with pgvector and serverless connection pooling.

### Rate Limiting Standards
- **Standard Merchant Endpoints**: 60 requests / minute per IP.
- **AI Brain Endpoints**: 15 requests / minute per user.
- **Authentication Routes**: 10 attempts / minute with exponential lockout.

When a rate limit is exceeded, DropAI returns \`HTTP 429 Too Many Requests\` with a JSON payload:
\`\`\`json
{
  "error": "Too many requests. Please wait before retrying.",
  "retryAfterSeconds": 60
}
\`\`\`
`,
  },

  // --- ADMIN DOCUMENTATION (ADMIN ONLY) ---
  {
    slug: "admin-owner-control-center-guide",
    title: "Owner Control Center Overview & Telemetry",
    description: "Platform-level operations, real-time revenue telemetry, database health, and root administration.",
    category: "admin-system",
    subcategory: "Platform Control",
    tags: "admin, owner, command center, telemetry, root",
    readingTime: "6 min read",
    sortOrder: 1,
    featured: false,
    visibility: "ADMIN_ONLY",
    content: `## Owner Super Admin Control Center

> [!CAUTION]
> This documentation is classified as **ADMIN_ONLY**. It contains operational procedures for platform root administrators.

### Core Telemetry
Platform administrators can monitor real-time infrastructure performance:
- Real-time gross merchandise value across all merchant tenants
- Active PostgreSQL connection pool latency and Neon compute autoscaling
- Universal AI token utilization rates and provider error cascades
- Multi-region uptime health for Order Webhook Routers and Shopify App Bridges
`,
  },
  {
    slug: "admin-user-lifecycle-and-access",
    title: "User Management, Suspensions & Subscriptions",
    description: "Managing merchant tenancies, executing administrative account suspensions, and overriding subscription tiers.",
    category: "admin-system",
    subcategory: "User Management",
    tags: "admin, users, suspension, subscription, plan",
    readingTime: "5 min read",
    sortOrder: 2,
    featured: false,
    visibility: "ADMIN_ONLY",
    content: `## User Tenancy & Access Management

Authorized administrators can inspect and manage merchant accounts via the internal management console.

### Administrative Actions
- **Suspend Merchant**: Halts all outbound AI requests and store webhooks if a merchant violates terms of service.
- **Subscription Overrides**: Upgrade accounts directly to \`SCALE\` or \`ENTERPRISE\` plans without charging external billing.
- **Session Purge**: Invalidate all active sessions across an entire user tenancy.
`,
  },
  {
    slug: "admin-ai-model-orchestration",
    title: "Universal AI Model Orchestration & Task Routing",
    description: "Connecting custom LLM providers (DeepSeek, Groq, Ollama), testing latency, and configuring dynamic routing.",
    category: "admin-system",
    subcategory: "AI Models",
    tags: "admin, ai models, universal client, deepseek, groq, gemini",
    readingTime: "6 min read",
    sortOrder: 3,
    featured: false,
    visibility: "ADMIN_ONLY",
    content: `## Universal AI Model Orchestration

Platform owners can configure and assign custom LLMs for distinct platform workloads.

### Dynamic Routing Matrix
- **Ad Copy Generation**: Google Gemini 3.6 Flash (Fast, high-creative output).
- **Product Research & Scoring**: DeepSeek V3 / OpenAI GPT-4o-mini (Structured analytical reasoning).
- **Customer Support Copilot**: Groq Llama 3.3 70B (Ultra-low latency inference).

Click **Test Connection** on any provider card to verify API credentials and live latency.
`,
  },
  {
    slug: "admin-emergency-lockdown-recovery",
    title: "Emergency Lockdown, Feature Flags & Disaster Recovery",
    description: "Activating platform kill-switches, scheduled maintenance modes, and snapshot restoration procedures.",
    category: "admin-system",
    subcategory: "Disaster Recovery",
    tags: "admin, lockdown, killswitch, maintenance, disaster recovery",
    readingTime: "5 min read",
    sortOrder: 4,
    featured: false,
    visibility: "ADMIN_ONLY",
    content: `## Platform Emergency Lockdown & Kill-Switches

Root administrators can activate immediate platform safeguards from the system control console:

### Kill-Switch Controls
- **Maintenance Mode**: Halts public traffic with HTTP 503 and informative maintenance screen.
- **Disable Registrations**: Temporarily stops new merchant signups during marketing surges.
- **Freeze Financials**: Stops automatic order payouts and supplier fulfillment API dispatches.
- **AI Circuit Breaker**: Disables outbound LLM API calls during upstream provider outages.
`,
  },
];

async function main() {
  console.log("🌱 Seeding DropAI Documentation & Knowledge Base...");

  let createdCount = 0;
  let updatedCount = 0;

  for (const article of ARTICLES) {
    const existing = await prisma.documentationArticle.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      await prisma.documentationArticle.update({
        where: { slug: article.slug },
        data: {
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          subcategory: article.subcategory,
          tags: article.tags,
          readingTime: article.readingTime,
          sortOrder: article.sortOrder,
          featured: article.featured,
          visibility: article.visibility,
          status: "PUBLISHED",
          author: "DropAI Engineering",
          version: "1.0.0",
        },
      });
      updatedCount++;
    } else {
      await prisma.documentationArticle.create({
        data: {
          slug: article.slug,
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          subcategory: article.subcategory,
          tags: article.tags,
          readingTime: article.readingTime,
          sortOrder: article.sortOrder,
          featured: article.featured,
          visibility: article.visibility,
          status: "PUBLISHED",
          author: "DropAI Engineering",
          version: "1.0.0",
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Documentation seeded successfully! Created: ${createdCount}, Updated: ${updatedCount}, Total Articles: ${ARTICLES.length}`);
}

main()
  .catch((err) => {
    console.error("❌ Documentation seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
