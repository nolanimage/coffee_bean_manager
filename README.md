# ☕ Coffee Bean Manager

A beautiful and intuitive coffee bean management system for coffee enthusiasts and professionals. Track your coffee collection, document tasting experiences, and manage your coffee inventory with ease.

## ✨ Features

### 🌟 **Coffee Bean Collection**
- **Comprehensive Tracking**: Record origin, roast level, process method, and detailed specifications
- **Visual Organization**: Group beans by country with beautiful cards and flags
- **Inventory Management**: Track stock levels, purchase dates, and expiry alerts
- **Multi-Currency Support**: Support for HKD, USD, and JPY with automatic formatting
- **Photo Upload**: Add beautiful photos of your coffee beans
- **Smart Forms**: Pre-filled edit forms with current data

### ☕ **Tasting Experience**
- **Detailed Tasting Notes**: Document brew methods, ratings, and personal notes
- **Rating System**: Multi-dimensional rating with overall quality scores (1-10 scale)
- **Brewing Documentation**: Record grind size, water temperature, and brew time
- **Visual History**: Beautiful timeline of your coffee journey
- **Auto-Date Recording**: Automatic timestamp recording for tasting sessions

### 📊 **Analytics & Insights**
- **Dashboard Overview**: Real-time statistics and recent activities
- **Cost Analysis**: Track spending and cost per cup calculations
- **Trend Analysis**: Visual charts showing your coffee preferences
- **Freshness Alerts**: Get notified when beans are expiring
- **Horizontal Scrolling**: Smooth navigation through coffee collections

### 🎨 **Modern Interface**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Horizontal Scrolling**: Smooth navigation through your coffee collection
- **Intuitive Navigation**: Easy-to-use interface with beautiful animations
- **Typography Optimized**: Beautiful, readable fonts and spacing
- **Touch-Friendly**: Optimized for mobile and tablet use

### 🔐 **User Management**
- **Secure Authentication**: Safe login and registration system
- **Password Reset**: Easy password recovery via email
- **Profile Management**: Update your information and preferences
- **Data Privacy**: Your coffee data stays private and secure

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for database)

### Option 1: One-Click Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/nolanimage/coffee_bean_manager.git
   cd coffee_bean_manager
   ```

2. **Set up environment**
   ```bash
   # Create environment file
   touch .env
   
   # Add your environment variables (see setup guide below)
   nano .env
   ```

3. **Start the application**
   ```bash
   # Run the setup script
   chmod +x start.sh
   ./start.sh
   ```

4. **Access your coffee manager**
   - 🌐 **Web App**: http://localhost:3000
   - 📱 **Mobile**: Works great on any device!

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../client && npm install
   ```

2. **Start the services**
   ```bash
   # Start backend (in server directory)
   cd server && npm start
   
   # Start frontend (in new terminal, client directory)
   cd client && npm start
   ```

## 📱 How to Use

### 1. **Get Started**
- Register an account or sign in
- Start by adding your first coffee bean

### 2. **Add Coffee Beans**
- Click "Add Coffee Bean" 
- Fill in the details (name, origin, roast level)
- Add initial stock and purchase information
- Upload a photo of your coffee bean
- Save and start tracking!

### 3. **Document Tastings**
- Select a coffee bean
- Choose your brew method
- Rate the coffee (1-10 scale) and add notes
- The tasting date is automatically recorded
- Build your tasting history

### 4. **Explore Analytics**
- View your dashboard for overview
- Check cost analysis for spending insights
- Monitor freshness alerts
- Explore your coffee journey with horizontal scrolling

### 5. **Edit Coffee Beans**
- Click on any coffee bean to view details
- Use the "Edit" button to modify information
- All fields are pre-filled with current data
- Save changes easily

## 🎯 Perfect For

### ☕ **Coffee Enthusiasts**
- Track your coffee journey
- Remember your favorite beans
- Document brewing experiments
- Build your coffee knowledge

### 🏪 **Coffee Shops & Roasteries**
- Manage coffee inventory
- Track customer preferences
- Monitor costs and margins
- Document roast profiles

### 📚 **Coffee Learners**
- Learn about different origins
- Understand roast levels
- Track your tasting progress
- Build your coffee vocabulary

## 🛠️ Technology

Built with modern web technologies for the best user experience:

- **Frontend**: React, Tailwind CSS, Lucide Icons, React Hook Form
- **Backend**: Node.js, Express, PostgreSQL, Supabase
- **Deployment**: Docker, Docker Compose
- **Security**: JWT authentication, bcrypt hashing
- **Database**: PostgreSQL with Row Level Security

## 🔧 Recent Fixes & Improvements

### ✅ **Latest Updates**
- **Fixed Tasting Note Creation**: Resolved data type issues with rating system
- **Improved Form Pre-filling**: Edit forms now properly display current data
- **Enhanced Typography**: Better font sizes and spacing throughout the app
- **Auto-Date Recording**: Tasting dates are automatically captured
- **Horizontal Scrolling**: Smooth navigation for coffee collections
- **Multi-Currency Support**: Full support for USD, HKD, and JPY

### 🐛 **Bug Fixes**
- Fixed "Failed to add coffee bean" validation issues
- Resolved "Failed to update coffee bean" form problems
- Fixed "Failed to load coffee bean" data fetching issues
- Corrected tasting note rating data types (integer vs float)
- Fixed date validation for optional fields

## 🤝 Contributing

We love coffee and we love collaboration! Whether you're a coffee professional, developer, or enthusiast, we'd love your help:

### 🌟 **How You Can Help**

**For Coffee Professionals:**
- Share your expertise about coffee varieties and brewing methods
- Help improve the tasting note system
- Provide feedback on inventory features

**For Developers:**
- Fix bugs and add new features
- Improve the codebase and documentation
- Create integrations with coffee services

**For Coffee Enthusiasts:**
- Test the application and provide feedback
- Share your coffee journey and needs
- Help spread the word about the project

### 🚀 **Getting Started**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🔮 Future Features

We're brewing up some exciting new features:

- 📱 **Mobile Apps**: Native iOS and Android applications
- 🌍 **Global Coffee Database**: Integration with coffee origin information
- 🤖 **AI Recommendations**: Smart coffee suggestions based on your preferences
- 📊 **Advanced Analytics**: Machine learning insights about your coffee journey
- 🔗 **Social Features**: Share and discover coffee with other enthusiasts
- 🛒 **E-commerce Integration**: Direct ordering from coffee suppliers

## 🔧 Environment Setup

To run this application, you'll need to set up environment variables. 

1. **Copy the environment sample file**:
   ```bash
   cp env.sample .env
   ```

2. **Edit the `.env` file** with your actual configuration values.

The `env.sample` file contains all required environment variables with helpful comments for database configuration, JWT secrets, API settings, and security parameters.

**⚠️ Security Notes**: 
- Always change the default passwords and JWT secrets in production environments!
- Use strong, unique passwords for all services
- Never commit your `.env` file to version control
- Consider using a secrets management service in production
- Regularly rotate JWT secrets and database passwords
- Use HTTPS in production environments

## 📞 Support

- 📖 **Documentation**: Check the codebase for detailed information
- 🐛 **Report Issues**: Use GitHub Issues for bugs and feature requests
- 💬 **Discussions**: Join our community conversations
- 📧 **Contact**: Reach out for collaboration opportunities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by coffee lovers, for coffee lovers**

*Let's brew something amazing together! ☕✨* 

## 🔒 Security Features

### 🛡️ **Authentication & Authorization**
- **JWT-based Authentication**: Secure token-based authentication with access and refresh tokens
- **Password Security**: Strong password requirements with bcrypt hashing (14 salt rounds)
- **Account Lockout**: Automatic account lockout after 5 failed login attempts
- **Session Management**: Configurable session timeouts and secure cookie settings
- **Role-based Access Control**: Framework for implementing user roles and permissions

### 🔐 **API Security**
- **Rate Limiting**: Prevents brute force attacks (100 requests/15min, 5 auth requests/15min)
- **Input Validation**: Comprehensive validation using express-validator
- **Request Size Limits**: Prevents large payload attacks (10MB limit)
- **CORS Protection**: Strict CORS configuration for cross-origin requests
- **Security Headers**: Comprehensive security headers including CSP, HSTS, XSS protection

### 🗄️ **Database Security**
- **Row Level Security (RLS)**: User-specific data access policies
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Audit Logging**: Comprehensive audit trail for all user actions
- **Connection Security**: Configurable SSL and connection limits
- **Data Encryption**: Sensitive data encryption at rest

### 🚨 **Monitoring & Logging**
- **Security Event Logging**: All authentication and authorization events logged
- **Error Handling**: Secure error messages that don't expose system details
- **Audit Trail**: Complete audit log with user actions, IP addresses, and timestamps
- **Failed Login Tracking**: Monitoring and alerting for suspicious activity

### 🔧 **Security Configuration**
- **Environment-based Settings**: Different security levels for development and production
- **Configurable Policies**: Easily adjustable security parameters
- **Secret Management**: Secure handling of API keys and secrets
- **HTTPS Enforcement**: Automatic HTTPS redirect in production

### 📋 **Security Best Practices**
- **Principle of Least Privilege**: Users only access their own data
- **Defense in Depth**: Multiple layers of security protection
- **Regular Updates**: Security patches and dependency updates
- **Security Headers**: Comprehensive browser security headers
- **Input Sanitization**: Protection against XSS and injection attacks

### 🚀 **Production Security Checklist**
- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and alerting
- [ ] Implement backup and recovery procedures
- [ ] Regular security audits and penetration testing
- [ ] Keep all dependencies updated
- [ ] Monitor audit logs for suspicious activity 