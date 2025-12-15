# Production Build Guide

This guide explains how to build and deploy the null_pointer monorepo for production.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database (for Prisma)
- Redis (for BullMQ queue)
- Judge0 API (for code execution)

## Build Process

The build process follows this order to ensure dependencies are built correctly:

1. **Generate Prisma Client** - Generates database client from schema
2. **Build Packages** - Builds all shared packages in parallel
   - `@repo/db` - Database package
   - `@repo/judge0-integration` - Judge0 integration service
   - `@repo/webhook-server` - Webhook server
   - `@repo/boilerplate-generator` - Boilerplate generator
3. **Build Apps** - Builds Next.js web application

## Build Commands

### Full Production Build

```bash
npm run build
```

This runs the complete build process:
- Generates Prisma client
- Builds all packages
- Builds Next.js app

### Individual Build Steps

```bash
# Generate Prisma client only
npm run prisma:generate

# Build all packages
npm run build:packages

# Build Next.js app only
npm run build:apps
```

### Build Individual Packages

```bash
# Build database package
npm run build --workspace=@repo/db

# Build Judge0 integration
npm run build --workspace=@repo/judge0-integration

# Build webhook server
npm run build --workspace=@repo/webhook-server

# Build boilerplate generator
npm run build --workspace=@repo/boilerplate-generator
```

## Production Deployment

### 1. Install Dependencies

```bash
npm install --production=false
```

### 2. Set Environment Variables

Create a `.env` file at the root with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/null_pointer"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# Judge0
JUDGE0_URL="https://your-judge0-instance.com"

# Redis
REDIS_URL="redis://localhost:6379"

# Webhook
WEBHOOK_URL="http://localhost:3001"
```

### 3. Run Database Migrations

```bash
npm run prisma:migrate:deploy
```

### 4. Build for Production

```bash
npm run build
```

### 5. Start Services

#### Next.js Web App
```bash
npm start
# or
npm run start --prefix apps/web
```

#### Judge0 Integration Service
```bash
npm run start:judge0
# or
npm run start --workspace=@repo/judge0-integration
```

#### Webhook Server
```bash
npm run start:webhook
# or
npm run start --workspace=@repo/webhook-server
```

## Build Output Locations

- **Next.js**: `apps/web/.next/`
- **@repo/db**: `packages/db/dist/`
- **@repo/judge0-integration**: `packages/judge0-integration/dist/`
- **@repo/webhook-server**: `packages/webhook-server/dist/`
- **@repo/boilerplate-generator**: `packages/boilerplate-generator/dist/`

## Production Checklist

- [ ] All environment variables are set
- [ ] Database migrations are applied
- [ ] Prisma client is generated
- [ ] All packages are built
- [ ] Next.js app is built
- [ ] Redis is running
- [ ] Judge0 API is accessible
- [ ] All services are started

## Troubleshooting

### Build fails with "Cannot find module @repo/db"
- Run `npm run prisma:generate` first
- Then run `npm run build:packages` before building apps

### TypeScript errors during build
- Ensure all dependencies are installed: `npm install`
- Check that workspace packages are properly linked

### Prisma client not found
- Run `npm run prisma:generate` to regenerate the client
- Ensure DATABASE_URL is set correctly

### Next.js build fails
- Check that all workspace dependencies are built first
- Verify `@repo/db` is built and Prisma client is generated

