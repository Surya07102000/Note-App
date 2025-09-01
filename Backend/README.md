# 📝 NoteApp Backend

A robust and feature-rich backend API for a collaborative note-taking application built with Node.js, Express.js, and MongoDB. Features include user authentication, role-based access control, note sharing, analytics, and AI-powered content generation.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, User roles)
- **Password hashing** using bcryptjs
- **User registration and login** with validation

### 📋 Note Management
- **CRUD operations** for notes (Create, Read, Update, Delete)
- **Rich text content** support with HTML formatting
- **Tag system** for better organization
- **Archive functionality** for note management
- **Search and filtering** by tags and content

### 🤝 Collaboration Features
- **Note sharing** with granular permissions (Read/Write)
- **User management** with role assignments
- **Shared note access control**
- **Collaborative editing** support

### 🤖 AI Integration
- **Google Gemini AI** integration for content generation
- **Smart content enhancement** (improve, summarize, expand)
- **Automatic tag generation** based on content
- **Template generation** for various note types
- **Writing suggestions** and content optimization

### 📊 Analytics & Monitoring
- **User activity tracking**
- **Note creation/modification statistics**
- **Usage analytics** for admins
- **System health monitoring**

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **AI Service**: Google Generative AI (Gemini)
- **HTTP Client**: Axios
- **Logging**: Morgan
- **CORS**: Express CORS middleware
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
Backend/
├── config/              # Configuration files
│   ├── config.js       # Main configuration
│   └── db.js           # Database connection
├── controllers/         # Request handlers
│   ├── authController.js      # Authentication logic
│   ├── noteController.js      # Note operations
│   ├── userController.js      # User management
│   ├── roleController.js      # Role management
│   └── analyticsController.js # Analytics
├── middleware/          # Custom middleware
│   ├── auth.js         # JWT authentication
│   └── admin.js        # Admin authorization
├── models/             # Database schemas
│   ├── user.js         # User model
│   ├── Note.js         # Note model
│   └── Role.js         # Role model
├── routes/             # API routes
│   ├── authRoutes.js   # Authentication endpoints
│   ├── noteRoutes.js   # Note CRUD endpoints
│   ├── userRoutes.js   # User management
│   ├── roleRoutes.js   # Role management
│   ├── analyticsRoutes.js # Analytics endpoints
│   └── aiRoutes.js     # AI service endpoints
├── services/           # Business logic services
│   └── geminiService.js # Google Gemini AI service
├── scripts/            # Utility scripts
│   ├── initDb.js       # Database initialization
│   └── checkDb.js      # Database health check
├── tests/              # Test suites
│   ├── auth.test.js    # Authentication tests
│   ├── notes.test.js   # Note functionality tests
│   ├── users.test.js   # User management tests
│   ├── roles.test.js   # Role system tests
│   ├── analytics.test.js # Analytics tests
│   └── integration/    # Integration tests
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://127.0.0.1:27017/notes_app
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRATION=24h
   
   # Google Gemini AI
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user info |

### Note Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all user notes |
| POST | `/api/notes` | Create a new note |
| GET | `/api/notes/:id` | Get specific note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| PATCH | `/api/notes/:id/archive` | Archive/Unarchive note |
| POST | `/api/notes/:id/share` | Share note with users |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (Admin) |

### Role Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Get all roles |
| POST | `/api/roles` | Create role (Admin) |
| PUT | `/api/users/:id/role` | Update user role (Admin) |

### AI Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate note content |
| POST | `/api/ai/enhance` | Enhance existing content |
| POST | `/api/ai/tags` | Generate tags for content |
| POST | `/api/ai/template` | Generate note templates |
| POST | `/api/ai/suggestions` | Get writing suggestions |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | System overview (Admin) |
| GET | `/api/analytics/users` | User statistics (Admin) |
| GET | `/api/analytics/notes` | Note statistics (Admin) |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection string | mongodb://127.0.0.1:27017/notes_app |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION` | Token expiration time | 24h |
| `GEMINI_API_KEY` | Google Gemini API key | Required for AI features |

### Database Models

#### User Model
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  password: String,       // Hashed password
  role: String,          // User role (user/admin)
  isActive: Boolean,     // Account status
  createdAt: Date,       // Registration date
  updatedAt: Date        // Last update
}
```

#### Note Model
```javascript
{
  title: String,         // Note title
  content: String,       // Note content (HTML)
  user: ObjectId,        // Note owner
  tags: [String],        // Associated tags
  isArchived: Boolean,   // Archive status
  sharedWith: [{         // Sharing permissions
    user: ObjectId,
    permission: String   // 'read' or 'write'
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:notes
npm run test:users
npm run test:roles
npm run test:analytics
npm run test:sharing
```

### Test Coverage

The test suite covers:
- ✅ Authentication flows
- ✅ CRUD operations for notes
- ✅ User management
- ✅ Role-based access control
- ✅ Note sharing functionality
- ✅ Analytics endpoints
- ✅ AI service integration

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run all tests |
| `npm run init-db` | Initialize database with default data |
| `npm run check-db` | Check database connection |

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password hashing** using bcryptjs with salt rounds
- **Input validation** and sanitization
- **CORS protection** for cross-origin requests
- **Environment variable protection** for sensitive data
- **Role-based authorization** for admin functions
- **API rate limiting** (configurable)

## 🤖 AI Integration

### Google Gemini Integration

The application integrates with Google's Gemini AI for:

- **Content Generation**: Create notes from prompts
- **Content Enhancement**: Improve, summarize, or expand existing content
- **Tag Generation**: Automatically suggest relevant tags
- **Template Creation**: Generate structured templates for different note types
- **Writing Assistance**: Provide suggestions and improvements

### AI Service Configuration

```javascript
// Example AI service usage
const aiService = require('./services/geminiService');

// Generate content
const result = await aiService.generateNoteContent(prompt, options);

// Enhance existing content
const enhanced = await aiService.enhanceNoteContent(content, type);
```

## 📈 Performance & Monitoring

- **Database indexing** for optimized queries
- **Request logging** with Morgan
- **Error handling** with custom middleware
- **Health check endpoints** for monitoring
- **Graceful shutdown** handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- **Express.js** for the robust web framework
- **MongoDB & Mongoose** for flexible database solutions
- **Google Gemini AI** for AI-powered features
- **JWT** for secure authentication
- **bcryptjs** for password security

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/noteapp-backend/issues) page
2. Review the API documentation above
3. Check the test files for usage examples
4. Create a new issue with detailed information

---

**Happy Coding! 🚀**
