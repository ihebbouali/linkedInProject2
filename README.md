# LinkedIn-like Job Platform

A comprehensive job platform with two types of accounts: **Personal** (for job seekers) and **Company** (for recruiters).

## Features

### Personal Accounts
- ✅ Create and manage professional profile
- ✅ Add skills and experience
- ✅ Browse available job listings
- ✅ Apply for jobs with cover letter
- ✅ Track application status
- ✅ Generate and download CV as PDF

### Company Accounts
- ✅ Post job openings
- ✅ Manage job listings
- ✅ Review applications
- ✅ Update application status (pending, reviewed, accepted, rejected)
- ✅ View candidate information

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Template Engine**: EJS
- **Session Management**: express-session
- **File Upload**: Multer
- **PDF Generation**: Puppeteer
- **Styling**: Bootstrap 5 + Custom CSS

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your MongoDB connection in `.env`:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/linkedin-jobs
   SESSION_SECRET=your_secret_key_here
   ```

5. Start MongoDB server

6. Run the application:
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

### Registration

1. Visit `/auth/register`
2. Choose account type:
   - **Personal**: For job seekers
   - **Company**: For recruiters
3. Fill in required information
4. For company accounts, provide company name

### Personal Account Features

- **Dashboard**: View and edit profile, skills, and experience
- **Jobs**: Browse all available jobs
- **Apply**: Submit applications with optional cover letter
- **CV**: Generate professional CV from profile data

### Company Account Features

- **Dashboard**: Manage company information
- **Post Job**: Create new job listings with detailed information
- **My Jobs**: View and manage all posted jobs
- **Applications**: Review candidate applications and update status

## Project Structure

```
linkedin/
├── app.js                  # Main application entry point
├── package.json
├── .env                    # Environment variables
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js            # User model (personal & company)
│   ├── Job.js             # Job posting model
│   └── JobApplication.js  # Application model
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── dashboardController.js  # Profile management
│   └── jobController.js   # Job and application management
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── dashboardRoutes.js # Dashboard routes
│   └── jobRoutes.js       # Job-related routes
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── jobs.ejs
│   ├── job-details.ejs
│   ├── post-job.ejs
│   ├── company-jobs.ejs
│   ├── job-applications.ejs
│   └── cv-template.ejs
└── public/
    ├── css/
    │   └── style.css      # Custom styling
    └── uploads/           # Profile pictures
```

## API Endpoints

### Authentication
- `GET /auth/register` - Registration page
- `POST /auth/register` - Register new user
- `GET /auth/login` - Login page
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Dashboard
- `GET /dashboard` - User dashboard
- `POST /dashboard/update` - Update profile
- `POST /dashboard/skills` - Add skill
- `GET /dashboard/skills/delete/:id` - Delete skill
- `POST /dashboard/experiences` - Add experience
- `GET /dashboard/experiences/delete/:id` - Delete experience
- `GET /dashboard/download-cv` - Download CV

### Jobs
- `GET /jobs` - List all jobs
- `GET /jobs/:id` - Job details
- `POST /jobs/:jobId/apply` - Apply for job (personal only)
- `GET /jobs/post-job/form` - Job posting form (company only)
- `POST /jobs/post-job` - Create job (company only)
- `GET /jobs/my-jobs/list` - Company's jobs (company only)
- `GET /jobs/my-jobs/:jobId/applications` - View applications (company only)
- `POST /jobs/applications/:appId/status` - Update application status (company only)
- `GET /jobs/my-jobs/:jobId/delete` - Delete job (company only)

## Future Enhancements

- Email notifications
- Advanced search and filtering
- Messaging between companies and candidates
- Job recommendations based on profile
- Company profiles and ratings
- Application analytics
- Multi-language support

## License

ISC
