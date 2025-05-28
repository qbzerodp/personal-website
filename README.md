# Personal Website

A modern personal website with theme switching, API integration, and a toast notification system.

## Deployment

This website is deployed on Netlify. To deploy your own copy:

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to [Netlify](https://app.netlify.com/)
4. Click "New site from Git"
5. Connect your GitHub account
6. Select your repository
7. Configure the build settings:
   - Build command: `python app.py`
   - Publish directory: `/`
8. Click "Deploy site"

## Features

- Theme switching with backend integration
- Toast notification system
- API endpoints for configuration and theme management
- Loading states and confirmation dialogs
- Keyboard shortcuts for toast management
- Queue system for notifications

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python Flask
- Dependencies: Flask, Flask-CORS, gunicorn
