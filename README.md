# Party Function Hall Management System

A comprehensive system for managing party function halls, bookings, customers, payments, and expenses.

## Features

- Hall booking and availability tracking
- Customer records and payment management
- Real-time revenue and occupancy analytics
- Event-specific expense tracking (decoration, catering, labor)
- Admin dashboard with role-based authentication
- Complete CRUD operations for halls, customers, bookings, and expenses
- Detailed analytics and reporting

## Tech Stack

| Layer      | Technology               | Purpose                  |
| ---------- | ------------------------ | ------------------------ |
| Frontend   | Next.js 14 (App Router)  | UI + API routes          |
| Styling    | Tailwind CSS + shadcn/ui | Modern responsive design |
| Auth       | NextAuth.js              | Secure role-based access |
| Database   | MongoDB (via Mongoose)   | NoSQL data storage       |
| ORM        | Mongoose                 | Schema modeling          |
| Validation | Zod                      | Input validation         |
| Charts     | Recharts                 | Analytics                |
| Deployment | Vercel                   | Hosting full-stack app   |

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and update the values
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Seed the database with initial data:
   ```bash
   npm run seed-all
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Login

Use the following credentials to log in as an admin:

- Email: admin@partyhall.com
- Password: Admin@123

## Project Structure

```
/app                  # Next.js App Router
  /api                # API routes
  /auth               # Authentication pages
  /dashboard          # Dashboard pages
    /halls            # Hall management pages
    /customers        # Customer management pages
    /bookings         # Booking management pages
    /expenses         # Expense management pages
/components           # React components
  /dashboard          # Dashboard-specific components
  /ui                 # UI components
  /halls              # Hall-related components
  /customers          # Customer-related components
  /bookings           # Booking-related components
  /expenses           # Expense-related components
/hooks                # Custom React hooks
/lib                  # Utility functions
/models               # Mongoose models
/public               # Static assets
/scripts              # Database seeding scripts
```

## CRUD Operations

The system provides complete CRUD (Create, Read, Update, Delete) operations for the following entities:

### Halls Management
- View all halls with search and filtering
- Add new halls with details like name, capacity, price, and features
- Edit existing hall information
- Delete halls when no longer needed

### Customers Management
- View all customers with search functionality
- Add new customers with contact information
- Edit customer details
- Delete customers
- View customer booking history

### Bookings Management
- View all bookings with search and status filtering
- Create new bookings with hall selection, customer selection, and scheduling
- Edit booking details including status and payment information
- Delete bookings

### Expenses Management
- View all expenses with search and category filtering
- Add new expenses with category classification (both booking-specific and generic expenses)
- Edit expense details with rich text description
- Auto-attribution of expenses to the logged-in user
- Delete expenses
- Form validation with visual feedback

## Deployment

This project is configured for deployment on Vercel. Follow these steps to deploy:

1. Create a GitHub repository and push your code
2. Create a Vercel account at [vercel.com](https://vercel.com)
3. Connect your GitHub repository to Vercel
4. Add the following environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_URL`: The URL of your deployed application
   - `NEXTAUTH_SECRET`: A secure random string for session encryption
5. Deploy the application

After deployment, you can share the Vercel URL with others to use the system.
