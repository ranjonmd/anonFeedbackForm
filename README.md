# Anonymous Feedback System - Step 1

A simple anonymous feedback form built with Next.js 14 and Tailwind CSS.

## 🎯 Current Status: Step 1 - Basic Form

**What works:**
- ✅ Beautiful, responsive form UI
- ✅ Form validation (required field, character limit)
- ✅ Loading states and success/error messages
- ✅ Character counter (10,000 character limit)

**What doesn't work yet:**
- ❌ No backend storage
- ❌ No encryption
- ❌ No notifications
- ❌ No viewing system

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🧪 Test the Form

1. Try submitting an empty form (should show error)
2. Try typing more than 10,000 characters (should be limited)
3. Try submitting valid feedback (should show success message)

## 📋 Next Steps

- **Step 2**: Add API endpoint to handle form submission
- **Step 3**: Add database storage
- **Step 4**: Add encryption
- **Step 5**: Add authentication for viewing
- **Step 6**: Add notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Form**: React hooks (useState)

## 📁 Project Structure

```
uams/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── SubmitForm.tsx
├── package.json
└── README.md
```

Simple and clean! 🎉
