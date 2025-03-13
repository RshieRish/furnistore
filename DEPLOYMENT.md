# Deployment Guide for Cornwallis Exchange

This guide will walk you through deploying the Cornwallis Exchange application using Vercel for the frontend and Railway for the backend.

## Prerequisites

- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account
- [Railway](https://railway.app/) account
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (for production database)
- [AWS](https://aws.amazon.com/) account (for S3 storage)
- [Stripe](https://stripe.com/) account (for payment processing)
- [Groq](https://groq.com/) account (for AI capabilities)

## Step 1: Deploy the Backend to Railway

1. **Create a MongoDB Atlas Cluster**:
   - Sign up for MongoDB Atlas
   - Create a new cluster
   - Set up a database user with password
   - Get your connection string

2. **Push Your Code to GitHub**:
   - Create a new GitHub repository
   - Push your code to the repository

3. **Deploy to Railway**:
   - Log in to Railway
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository
   - Configure the following environment variables in Railway:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/furniture-store?retryWrites=true&w=majority
     JWT_SECRET=<your-secure-jwt-secret>
     GROQ_API_KEY=<your-groq-api-key>
     AWS_ACCESS_KEY_ID=<your-aws-access-key>
     AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
     AWS_BUCKET_NAME=<your-bucket-name>
     AWS_REGION=<your-aws-region>
     STRIPE_SECRET_KEY=<your-stripe-secret-key>
     STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
     STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
     PORT=3000
     FRONTEND_URL=<your-vercel-frontend-url>
     ```
   - Deploy the application
   - Once deployed, note the URL of your Railway app (e.g., `https://your-app-name.railway.app`)

## Step 2: Deploy the Frontend to Vercel

1. **Push Your Code to GitHub**:
   - If you haven't already, push your frontend code to GitHub

2. **Deploy to Vercel**:
   - Log in to Vercel
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the following environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
     NEXT_PUBLIC_WS_URL=wss://your-app-name.railway.app
     ```
   - Click "Deploy"
   - Once deployed, note the URL of your Vercel app (e.g., `https://your-app-name.vercel.app`)

3. **Update Backend with Frontend URL**:
   - Go back to Railway
   - Update the `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy the backend

## Step 3: Configure CORS and Security

1. **Update CORS Settings**:
   - Ensure your backend's CORS settings allow requests from your Vercel domain
   - The current setup should work if you've set the `FRONTEND_URL` correctly

2. **Set Up Stripe Webhooks**:
   - In your Stripe dashboard, create a webhook pointing to `https://your-app-name.railway.app/payments/webhook`
   - Update the `STRIPE_WEBHOOK_SECRET` in Railway with the secret from Stripe

## Step 4: Verify Deployment

1. **Test the Application**:
   - Visit your Vercel URL
   - Try logging in with the admin credentials:
     - Email: admin@cornwallis.com
     - Password: Admin@123
   - Test the core functionality:
     - Browse furniture
     - Create estimates
     - Process payments
     - Access admin dashboard

2. **Monitor Logs**:
   - Check Railway logs for backend issues
   - Check Vercel logs for frontend issues

## Troubleshooting

- **CORS Issues**: Ensure the `FRONTEND_URL` in Railway matches your Vercel URL exactly
- **Database Connection**: Verify your MongoDB Atlas connection string and network access settings
- **API Errors**: Check Railway logs for backend errors
- **Image Upload Issues**: Verify AWS S3 credentials and bucket permissions
- **Payment Processing**: Ensure Stripe API keys are correct and webhook is properly configured

## Maintenance

- **Scaling**: Railway and Vercel both offer scaling options as your application grows
- **Monitoring**: Set up monitoring for your application using Railway's built-in metrics
- **Updates**: To update your application, push changes to your GitHub repository and both Railway and Vercel will automatically redeploy 