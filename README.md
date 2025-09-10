# 📝 Note App - Full Stack Application

A comprehensive note-taking application built with Angular frontend and Node.js backend, featuring user authentication, role-based access control, AI-powered note generation, and real-time collaboration.

## 🚀 Live Demo

- **Frontend**: [https://note-app-frontend-diim.onrender.com](https://note-app-frontend-diim.onrender.com)
- **Backend API**: [https://note-app-backend-d01m.onrender.com](https://note-app-backend-d01m.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 16
- **Styling**: SCSS + Tailwind CSS
- **Charts**: Chart.js + ng2-charts
- **Icons**: Material Icons
- **State Management**: RxJS Observables

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini AI
- **Security**: bcryptjs for password hashing

## 📁 Project Structure

```
Note-App/
├── Backend/                    # Node.js Backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Authentication & authorization
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   ├── tests/                 # Test files
│   └── server.js              # Main server file
├── Frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Angular services
│   │   │   ├── guards/        # Route guards
│   │   │   └── interceptors/  # HTTP interceptors
│   │   ├── environments/      # Environment configurations
│   │   └── assets/            # Static assets
│   └── angular.json           # Angular configuration
└── README.md                  # This file
```

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Admin, User)
- Protected routes with auth guards
- Session management with token validation

### 📝 Note Management
- Create, read, update, and delete notes
- Rich text editing capabilities
- Note categorization and tagging
- Search and filter functionality
- Note archiving and restoration

### 🤖 AI-Powered Features
- AI note generation using Google Gemini
- Content enhancement and suggestions
- Multiple tone options (Professional, Casual, Academic, Creative)
- Various output formats (Structured, Bullet points, Paragraphs, Outlines)

### 👥 User Management
- User profile management
- Role assignment and management
- User activity tracking
- Admin dashboard for user oversight

### 📊 Analytics Dashboard
- User engagement metrics
- Note creation statistics
- System usage analytics
- Interactive charts and graphs

### 🔄 Real-time Collaboration
- Note sharing between users
- Collaborative editing
- Permission management
- Activity tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Angular CLI
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Surya07102000/Note-App.git
   cd Note-App/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/notes_app
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRATION=24h
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'
   };
   ```

4. **Start the development server**
   ```bash
   ng serve
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Token validation

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Share note

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Roles
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role (Admin only)
- `PUT /api/roles/:id` - Update role (Admin only)
- `DELETE /api/roles/:id` - Delete role (Admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/users` - Get user analytics
- `GET /api/analytics/notes` - Get note analytics

### AI Services
- `POST /api/ai/generate` - Generate AI content
- `POST /api/ai/enhance` - Enhance existing content
- `POST /api/ai/template` - Generate from template

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd Frontend
ng test
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Frontend Deployment (Render)
1. Create a new Static Site in Render
2. Connect to your GitHub repository
3. Set build command: `cd Frontend && npm install && npm run build`
4. Set publish directory: `Frontend/dist/frontend`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=24h
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend (environment files)
```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://note-app-backend-d01m.onrender.com/api'
};
```

## 📱 Features Overview

### User Roles
- **Admin**: Full system access, user management, analytics
- **User**: Note management, basic features

### Note Features
- Rich text editing
- AI-powered content generation
- Note sharing and collaboration
- Search and filtering
- Categories and tags

### Security Features
- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Surya Kanta Nag**
- GitHub: [@Surya07102000](https://github.com/Surya07102000)
- Email: suryakantanag05@gmail.com

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Express.js community
- MongoDB for the database solution
- Google Gemini AI for AI capabilities
- Render for hosting services

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/Surya07102000/Note-App/issues) page
2. Create a new issue if your problem isn't already addressed
3. Contact the author via email

---

⭐ **Star this repository if you found it helpful!**
