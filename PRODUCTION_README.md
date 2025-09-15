# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### Environment Setup
- [ ] Copy `.env.example` to `.env` and fill in production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set up production Solana RPC endpoint
- [ ] Configure monitoring services (Sentry, analytics)

### Database Setup
- [ ] Run `npm run db:migrate` to apply migrations
- [ ] Run `npm run db:seed` if needed (only for initial setup)
- [ ] Verify database connectivity with `npm run db:health`

### Build & Deploy
- [ ] Run `npm run build` to create production build
- [ ] Test build locally with `npm run preview`
- [ ] Deploy to production environment
- [ ] Verify all environment variables are set

## 🔧 Production Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="mysql://user:pass@host:port/db"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Solana
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="mainnet-beta"

# Security (generate secure random strings)
JWT_SECRET="your-256-bit-secret"
ENCRYPTION_KEY="your-32-byte-key"

# Monitoring (optional)
SENTRY_DSN="your-sentry-dsn"
GA_TRACKING_ID="GA-XXXXXXXXX"
LOG_LEVEL="info"
```

### Database Production Settings
- Use connection pooling
- Set appropriate connection limits
- Enable SSL connections
- Configure backup strategies
- Set up monitoring alerts

## 📊 Monitoring & Maintenance

### Health Checks
- Database connectivity: `/api/health/database`
- API responsiveness: `/api/health/api`
- Overall system health: `/api/health`

### Logs to Monitor
- Authentication failures
- Database connection errors
- API rate limit hits
- Performance metrics (response times > 1s)

### Performance Optimization
- Enable gzip compression
- Set up CDN for static assets
- Configure proper caching headers
- Monitor Core Web Vitals
- Set up database query monitoring

## 🔒 Security Considerations

### API Security
- Rate limiting is enabled for all API routes
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS protection via Content Security Policy

### Authentication Security
- Wallet signature verification
- Secure session management
- CSRF protection
- Secure headers configured

### Infrastructure Security
- HTTPS only (configure SSL/TLS)
- Regular security updates
- Database encryption at rest
- Secure environment variable management

## 🚨 Emergency Procedures

### Rollback Plan
1. Keep previous deployment version available
2. Have database backup before migrations
3. Monitor error rates post-deployment
4. Be prepared to rollback within 15 minutes

### Incident Response
1. Check health endpoints
2. Review error logs
3. Check database connectivity
4. Monitor user reports
5. Communicate with users if needed

## 📈 Scaling Considerations

### Horizontal Scaling
- Stateless application design
- External session storage if needed
- Database read replicas
- CDN for static assets

### Database Scaling
- Connection pooling configured
- Query optimization
- Index monitoring
- Backup strategy

### Performance Monitoring
- Response time monitoring
- Error rate tracking
- Database query performance
- User experience metrics

## 🔧 Maintenance Tasks

### Daily
- Monitor error logs
- Check database health
- Review performance metrics

### Weekly
- Security updates
- Database maintenance
- Log rotation

### Monthly
- Full database backup verification
- Performance optimization review
- Security audit

## 📞 Support & Monitoring

### External Services Integration
- **Error Tracking**: Sentry configured for production
- **Analytics**: Vercel Analytics enabled
- **Performance**: Web Vitals monitoring
- **Database**: Health checks and monitoring

### Alert Configuration
- High error rates (>5%)
- Database connection failures
- Response times > 3 seconds
- Security incidents

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm ci

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Verification Checklist

After deployment:
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Database connections successful
- [ ] API endpoints respond
- [ ] Error pages display properly
- [ ] SSL certificate valid
- [ ] Monitoring systems receiving data