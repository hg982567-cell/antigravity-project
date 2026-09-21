# DropAI - Next-Gen E-Commerce & Dropshipping Platform

DropAI is an enterprise-grade AI-powered dropshipping and e-commerce automation platform built with Next.js 14, Tailwind CSS, Prisma ORM, and Neon Cloud PostgreSQL.

## Architecture
- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Lakebase Cloud PostgreSQL
- **ORM**: Prisma 5.22
- **Authentication**: Firebase Authentication & Zero-Trust Session RBAC
- **Deployment**: Vercel Serverless

## Database Configuration
- `DATABASE_URL`: Neon PostgreSQL pooled connection (AWS US-East-1)
- `DIRECT_URL`: Neon PostgreSQL direct connection for schema migrations
