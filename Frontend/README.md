# Notes Application - Frontend

A modern Angular-based web application for note management with AI assistance, user management, and analytics features.

## 🚀 Features

- **User Authentication** - Secure login and registration system
- **Note Management** - Create, edit, delete, and organize notes with tags
- **AI Assistant** - AI-powered note generation, enhancement, and suggestions
- **User Management** - Admin panel for managing users and roles
- **Analytics Dashboard** - Insights and statistics about notes and users
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Updates** - Live data synchronization
- **Role-based Access Control** - Different permission levels for users

## 🛠️ Tech Stack

- **Framework**: Angular 16.2.0
- **Styling**: TailwindCSS 3.3.6 + SCSS
- **Charts**: Chart.js 4.5.0 with ng2-charts
- **HTTP Client**: Angular HttpClient with interceptors
- **Forms**: Reactive Forms with validation
- **Routing**: Angular Router with guards
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **Angular CLI** (version 16 or higher)

```bash
# Install Angular CLI globally
npm install -g @angular/cli@16
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the Frontend root directory:
   ```env
   # Frontend Environment Variables
   NG_APP_API_BASE_URL=http://localhost:5000/api
   ```

4. **Update environment configuration**
   
   Ensure your `src/environments/environment.ts` has the correct API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'
   };
   ```

## 🚀 Running the Application

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you make changes to the source files.

### Production Build

```bash
npm run build
# or
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

### Testing

```bash
npm test
# or
ng test
```

### Linting

```bash
ng lint
```

## 📱 Application Structure

```
src/
├── app/
│   ├── components/
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── dashboard/         # Main dashboard
│   │   ├── login/            # Login page
│   │   ├── nav/              # Navigation component
│   │   ├── notes/            # Notes management
│   │   ├── register/         # User registration
│   │   ├── roles/            # Role management
│   │   └── users/            # User management
│   ├── guards/
│   │   └── auth.guard.ts     # Route protection
│   ├── interceptors/
│   │   └── auth.interceptor.ts # HTTP request interceptor
│   ├── services/
│   │   ├── ai.service.ts     # AI assistant functionality
│   │   ├── analytics.service.ts # Analytics data
│   │   ├── auth.service.ts   # Authentication
│   │   ├── notes.service.ts  # Notes management
│   │   ├── role.service.ts   # Role management
│   │   └── user.service.ts   # User management
│   ├── app-routing.module.ts # Application routes
│   └── app.module.ts         # Main app module
├── environments/             # Environment configurations
└── assets/                  # Static assets
```

## 🔗 Available Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/login` | LoginComponent | User login | No |
| `/register` | RegisterComponent | User registration | No |
| `/dashboard` | DashboardComponent | Main dashboard | Yes |
| `/notes` | NotesComponent | Notes management | Yes |
| `/users` | UsersComponent | User management | Yes |
| `/roles` | RolesComponent | Role management | Yes |
| `/analytics` | AnalyticsComponent | Analytics dashboard | Yes |

## 🔒 Authentication

The application uses JWT-based authentication:

- **Login/Register**: Users can create accounts and log in
- **Token Storage**: JWT tokens are stored in localStorage
- **Route Protection**: Protected routes require authentication
- **Auto-logout**: Invalid tokens trigger automatic logout
- **Interceptor**: Automatically adds auth headers to API requests

## 🎨 Styling

The application uses a combination of:

- **TailwindCSS**: Utility-first CSS framework
- **SCSS**: For custom styles and component-specific styling
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme support (if implemented)

## 📊 Features Overview

### Notes Management
- Create, edit, and delete notes
- Tag system for organization
- Search and filter functionality
- Archive/unarchive notes
- Share notes with other users

### AI Assistant
- Generate notes from prompts
- Enhance existing content
- Suggest improvements
- Auto-generate tags
- Multiple tone and format options

### User Management (Admin)
- View all users
- Manage user roles
- User activity tracking
- Bulk operations

### Analytics
- User activity metrics
- Popular tags analysis
- Notes creation trends
- System usage statistics

## 🌐 Environment Configuration

### Development
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### Production
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## 🔧 Configuration

### API Base URL
The application connects to a backend API. Update the API URL in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

### TailwindCSS
Configuration is in `tailwind.config.js`. Customize colors, fonts, and other design tokens as needed.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   ng serve --port 4201
   ```

2. **API connection issues**
   - Ensure backend server is running
   - Check API URL in environment files
   - Verify CORS settings on backend

3. **Node modules issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Build errors**
   ```bash
   ng build --verbose
   ```

## 📚 Dependencies

### Main Dependencies
- `@angular/core`: ^16.2.0
- `@angular/common`: ^16.2.0
- `@angular/forms`: ^16.2.0
- `@angular/router`: ^16.2.0
- `chart.js`: ^4.5.0
- `ng2-charts`: ^4.1.1
- `rxjs`: ~7.8.0

### Development Dependencies
- `@angular/cli`: ~16.2.0
- `typescript`: ~5.1.3
- `tailwindcss`: ^3.3.6

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the application logs in browser console
3. Ensure backend API is running and accessible
4. Verify environment configuration

## 🔄 Updates

To update the application:

```bash
# Update Angular CLI
npm install -g @angular/cli@latest

# Update project dependencies
ng update @angular/core @angular/cli

# Update other dependencies
npm update
```

---

**Happy coding! 🎉**
