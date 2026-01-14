# Quick Start Guide

## Setup Instructions

1. **Dependencies are already installed** ✓

2. **Database Configuration** ✓
   - MongoDB Atlas is configured in `.env`
   - Connection string is ready

3. **Start the Server**:
   ```bash
   npm start
   ```

4. **Access the Application**:
   - Open your browser
   - Navigate to: http://localhost:3000

## First Steps

### Create a Personal Account (Job Seeker)
1. Click "S'inscrire" (Register)
2. Select "Compte Personnel"
3. Fill in your information
4. Click "S'inscrire"
5. You'll be redirected to your dashboard

**What you can do:**
- Complete your profile
- Add skills and experience
- Browse job listings at `/jobs`
- Apply for jobs
- Download your CV

### Create a Company Account (Recruiter)
1. Click "S'inscrire" (Register)
2. Select "Compte Entreprise"
3. Fill in your information and company name
4. Click "S'inscrire"
5. You'll be redirected to your dashboard

**What you can do:**
- Post new job listings
- Manage your job postings
- Review applications
- Update application status (pending/reviewed/accepted/rejected)

## Key Features

### For Personal Accounts:
- ✓ Professional profile management
- ✓ Skills and experience tracking
- ✓ Job browsing and search
- ✓ Apply for jobs with cover letter
- ✓ PDF CV generation
- ✗ CANNOT post jobs

### For Company Accounts:
- ✓ Company profile management
- ✓ Post job listings
- ✓ Manage job postings
- ✓ Review applications
- ✓ Update application status
- ✗ CANNOT apply for jobs

## Navigation

### Personal Account Menu:
- **Mon Profil**: Your dashboard
- **Offres d'emploi**: Browse all jobs
- **Déconnexion**: Logout

### Company Account Menu:
- **Mon Profil**: Your dashboard
- **Offres d'emploi**: Browse all jobs
- **Mes Offres**: Manage your job postings
- **Publier une Offre**: Create new job listing
- **Déconnexion**: Logout

## Testing the Application

### Test Scenario 1: Personal Account
1. Register as personal account
2. Go to dashboard and add some skills
3. Add an experience
4. Go to "Offres d'emploi"
5. Apply for a job

### Test Scenario 2: Company Account
1. Register as company account
2. Click "Publier une Offre"
3. Fill in job details
4. Submit the job
5. Go to "Mes Offres" to see your posting
6. Wait for applications
7. Review and update application status

## Troubleshooting

### Port already in use
If port 3000 is already in use, change it in `.env`:
```
PORT=3001
```

### MongoDB Connection Error
- Check your internet connection
- Verify the MONGO_URI in `.env` is correct
- Make sure your IP is whitelisted in MongoDB Atlas

### Cannot upload images
- Make sure the `public/uploads/` directory exists
- Check file permissions

## Default Credentials
None - you need to create your own accounts through registration.

## Development Mode
To run with auto-restart on file changes:
```bash
npm run dev
```
(Note: You need to install nodemon first if using dev mode)

## Project Status
✓ All features implemented
✓ CSS styling completed
✓ Two account types working
✓ Job posting and application system functional
✓ Ready for use!
