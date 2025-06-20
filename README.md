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

## Enhanced Benefits for vLLM and Ollama Users

### 🔗 Perfect Integration with Your Local Models

OpenAI Proxy HUB is designed to **complement** your existing vLLM and Ollama deployments, not replace them. Add enterprise-grade management and multi-provider capabilities to your local inference setup.

### 🏢 Transform Your Local Models into Enterprise Solutions

| Challenge with Local Models | OpenAI Proxy HUB Solution |
|------------------------------|---------------------------|
| **No User Management** | Add API keys, permissions, and quotas to your vLLM/Ollama endpoints |
| **Basic Monitoring** | Comprehensive logging, analytics, and request tracking |
| **Single Endpoint Access** | Unified interface for local and cloud models |
| **No Fallback Options** | Route to cloud APIs when local models are unavailable |
| **Limited Model Aliases** | Create friendly names for complex local model paths |
| **No Cost Tracking** | Monitor usage patterns and optimize resource allocation |

### 🚀 Integration Benefits

#### **1. Hybrid Cloud-Local Architecture**
```
Your Setup: vLLM/Ollama running locally
+ OpenAI Proxy HUB: Unified management layer

Benefits:
✅ Use local models for sensitive data
✅ Fallback to cloud APIs for high availability
✅ Single SDK integration for developers
✅ Centralized monitoring and logging
```

#### **2. Enterprise User Management**
```
Before: Direct access to your vLLM/Ollama endpoints
After: Managed access through OpenAI Proxy HUB

Features Added:
✅ Individual API keys for team members
✅ Usage quotas and rate limiting
✅ Permission-based model access
✅ Audit trails for compliance
```

#### **3. Operational Visibility**
```
Your vLLM/Ollama: Great inference performance
+ Proxy HUB: Enterprise monitoring

Combined Benefits:
✅ Real-time dashboard for all models
✅ Performance metrics and error tracking
✅ Usage analytics and cost allocation
✅ Alerting and notification systems
```

### 💡 Real-World Integration Scenarios

#### **Scenario 1: Local Models with Cloud Backup**
```
Setup:
- Primary: Your vLLM deployment with custom models
- Fallback: OpenAI/Anthropic via Proxy HUB
- Management: Unified dashboard for both

Benefits:
- 99.9% uptime with automatic failover
- Use expensive cloud APIs only when needed
- Single endpoint for your applications
```

#### **Scenario 2: Multi-Team Local Deployment**
```
Setup:
- Infrastructure: Your Ollama/vLLM servers
- Access Layer: OpenAI Proxy HUB with user management
- Integration: Teams use standard OpenAI SDK

Benefits:
- Secure access to your local models
- Usage tracking per team/user
- No changes to existing code
```

#### **Scenario 3: Hybrid Model Routing**
```
Setup:
- Sensitive queries → Your local vLLM
- General queries → Cloud APIs (cheaper)
- Creative tasks → Specialized cloud models

Benefits:
- Optimal cost and performance
- Data privacy for sensitive workloads
- Model specialization for different tasks
```

### 🔧 Technical Integration

#### **Adding Your Local Models**
1. **vLLM Integration**: Add your vLLM endpoint as an API provider
2. **Ollama Integration**: Configure Ollama server as local API
3. **Model Aliases**: Create friendly names for your local models
4. **Routing Rules**: Set up automatic routing based on request type

#### **Sample Configuration**
```yaml
APIs:
  - name: "Local vLLM"
    baseUrl: "http://your-vllm-server:8000"
    type: "local"
    
  - name: "Local Ollama" 
    baseUrl: "http://your-ollama:11434"
    type: "local"
    
  - name: "OpenAI Backup"
    baseUrl: "https://api.openai.com"
    apiKey: "your-openai-key"
    type: "cloud"

Model Aliases:
  - alias: "code-model"
    provider: "Local vLLM"
    model: "codellama-34b-instruct"
    
  - alias: "chat-model"
    provider: "Local Ollama"
    model: "llama2:70b"
```

### 🎯 Perfect for Your Use Cases

#### **If You're Using vLLM:**
- **Keep your high-performance inference**
- **Add enterprise management layer**
- **Enable multi-user access with permissions**
- **Add monitoring and analytics**
- **Implement fallback to cloud providers**

#### **If You're Using Ollama:**
- **Maintain your local development workflow**
- **Add production-ready user management**
- **Enable team collaboration features**
- **Implement usage tracking and quotas**
- **Add cloud model integration**

### 📈 Enhanced Value Proposition

#### **Cost Optimization**
- Use your existing local infrastructure for most queries
- Route only specific queries to expensive cloud APIs
- Track usage patterns to optimize resource allocation
- Implement intelligent caching to reduce inference costs

#### **Performance Benefits**
- Keep low-latency local inference for critical paths
- Add high-availability with cloud fallbacks
- Load balance across multiple local endpoints
- Cache frequent queries to improve response times

#### **Operational Excellence**
- Unified monitoring for local and cloud models
- Centralized logging and error tracking
- User management and access controls
- Automated failover and health checks

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
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   SESSION_SECRET=your-secure-session-secret-key
   NODE_ENV=development
   ```

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
   SESSION_SECRET=your-production-session-secret
   NODE_ENV=production
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
     -e SESSION_SECRET="your-secure-secret" \
     -e NODE_ENV="production" \
     openai-proxy-hub
   ```

#### Docker Environment Variables

Create a `.env.docker` file:
```env
POSTGRES_PASSWORD=secure_database_password
SESSION_SECRET=your-production-session-secret
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

- **Change default admin password** immediately
- **Use strong session secrets** in production
- **Enable HTTPS** for production deployments
- **Regularly rotate API keys**
- **Monitor request logs** for suspicious activity
- **Keep dependencies updated**

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
   - Verify session configuration

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