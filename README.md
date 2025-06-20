# OpenAI Proxy HUB

A comprehensive OpenAI-compatible API proxy hub that centralizes multiple AI APIs under a unified interface. Manage API providers, model aliases, users, and monitor requests through an intuitive admin dashboard.

## Features

- **Unified API Interface**: Single `/v1` endpoint compatible with OpenAI SDK
- **Multi-Provider Support**: Route requests to different AI API providers
- **Model Aliasing**: Create friendly names for complex model identifiers
- **User Management**: API key-based authentication with granular permissions
- **Admin Dashboard**: Full-featured web interface for system management
- **Request Logging**: Comprehensive monitoring and analytics
- **Secure Authentication**: Session-based admin auth with bcrypt password encryption
- **Configuration Management**: Centralized settings for proxy behavior

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React 18, TypeScript, Vite
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Express sessions with bcrypt

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd openai-proxy-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```
   
   **Security Note**: Never commit the `.env` file to version control. It contains sensitive credentials.

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Production Deployment

### Option 1: Traditional Server Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   DATABASE_URL=your-production-database-url
   PORT=5000
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

#### Quick Start with Docker Compose (Recommended)

1. **Set up environment variables**
   ```bash
   cp .env.example .env.docker
   # Edit .env.docker with your production values
   ```

2. **Start the application stack**
   ```bash
   docker-compose up -d
   ```

This will start both the PostgreSQL database and the application. The database will be automatically initialized.

#### Manual Docker Build

1. **Build the image**
   ```bash
   docker build -t openai-proxy-hub .
   ```

2. **Run with external database**
   ```bash
   docker run -d \
     --name openai-proxy-hub \
     -p 5000:5000 \
     -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
     openai-proxy-hub
   ```

#### Docker Environment Variables

Create a `.env.docker` file:
```env
POSTGRES_PASSWORD=secure_database_password
DATABASE_URL=postgresql://proxy_user:secure_database_password@postgres:5432/openai_proxy_hub
```

#### Docker Management Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Access database
docker-compose exec postgres psql -U proxy_user -d openai_proxy_hub
```

### Option 3: Replit Deployment

1. Connect your repository to Replit
2. Set environment variables in Replit Secrets:
   - `DATABASE_URL`
   - `SESSION_SECRET`
3. The application will auto-deploy when you push changes

## Initial Setup

1. **Access the admin dashboard** at `http://your-domain:5000`
2. **Login with default credentials**:
   - Username: `admin`
   - Password: `admin123`
3. **Change the default password** immediately in Admin Management
4. **Configure API providers** in the API Providers section
5. **Set up model aliases** for easier client integration
6. **Create API users** and distribute API keys

## API Usage

Once configured, use the proxy endpoint as a drop-in replacement for OpenAI's API:

```javascript
// Using OpenAI SDK
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-domain.com/v1',
  apiKey: 'your-proxy-api-key'
});

const response = await openai.chat.completions.create({
  model: 'coder-model', // Your custom alias
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

```bash
# Using curl
curl -X POST https://your-domain.com/v1/chat/completions \
  -H "Authorization: Bearer your-proxy-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "coder-model",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Configuration

### API Providers
- Add upstream API endpoints (OpenAI, Anthropic, local models, etc.)
- Configure API keys and base URLs
- Set model names for each provider

### Model Aliases
- Create friendly names like "coder-model" → "Qwen/Qwen2.5-Coder-14B-Instruct-AWQ"
- Map aliases to specific API providers
- Enable/disable aliases as needed

### User Management
- Generate API keys for clients
- Set allowed models per user
- Monitor usage and manage permissions

### System Configuration
- Set request timeouts and retry policies
- Configure logging levels
- Enable/disable rate limiting

## API Endpoints

### Admin API (Protected)
- `GET /api/stats` - System statistics
- `GET /api/apis` - List API providers
- `POST /api/apis` - Create API provider
- `GET /api/model-aliases` - List model aliases
- `GET /api/users` - List API users
- `GET /api/request-logs` - View request logs
- `GET /api/admins` - Admin management

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Current session

### Proxy API (Public)
- `POST /v1/chat/completions` - OpenAI-compatible chat endpoint
- `POST /v1/*` - Other OpenAI-compatible endpoints

## Security Considerations

- **Change default admin password** immediately after first login
- **Never commit `.env` files** to version control - they contain sensitive credentials
- **Enable HTTPS** for production deployments
- **Regularly rotate API keys** and database passwords
- **Monitor request logs** for suspicious activity
- **Keep dependencies updated** with regular security patches
- **Use environment-specific configurations** for different deployment stages

## Monitoring

The dashboard provides:
- Real-time request statistics
- API provider health status
- User activity monitoring
- Error rate tracking
- Response time metrics

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Admin Login Failed**
   - Confirm default credentials: admin/admin123
   - Check if admin account exists in database
   - Verify session configuration is working

3. **API Requests Failing**
   - Check API provider configurations
   - Verify upstream API keys
   - Review model alias mappings
   - Check user permissions

4. **Port Already in Use**
   - Change port in environment variables
   - Kill existing processes: `lsof -ti:5000 | xargs kill`

### Logs

View application logs for debugging:
```bash
# Development
npm run dev

# Production (if using PM2)
pm2 logs openai-proxy-hub
```

## Development

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Dashboard pages
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   ├── proxy.ts         # Proxy middleware
│   └── seed.ts          # Database seeding
├── shared/              # Shared types
│   └── schema.ts        # Database schema
└── README.md
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Apply database changes
- `npm run check` - Type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review application logs
- Open an issue on the repository

---

**Note**: This is a powerful proxy that handles API keys and routes requests to external services. Always follow security best practices and keep the system updated.