# StudyVault 📚

A modern web platform for students to share and access question papers from various colleges and universities.

## Features ✨

### For Students
- **User Authentication**: Secure registration and login system
- **Paper Upload**: Easy PDF upload with drag & drop functionality
- **Paper Browsing**: Search and filter papers by college, semester, course, and subject
- **Paper Preview**: View papers before downloading
- **Like System**: Like and save favorite papers
- **Dashboard**: Personal dashboard with uploads, likes, and statistics
- **Profile Management**: Update personal information and settings

### Technical Features
- **Modern UI**: Built with React, TypeScript, and TailwindCSS
- **Real-time Database**: Firebase Firestore for data persistence
- **File Storage**: Firebase Storage for secure PDF storage
- **Authentication**: Firebase Authentication with email/password
- **Responsive Design**: Mobile-first responsive design
- **Type Safety**: Full TypeScript implementation

## Tech Stack 🛠️

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Set up Storage
   - Get your Firebase config

4. **Configure Firebase**
   - Open `src/services/firebase.ts`
   - Replace the placeholder config with your actual Firebase configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read and write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Papers can be read by everyone, written by authenticated users
       match /papers/{paperId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Likes can be read and written by authenticated users
       match /likes/{likeId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

6. **Set up Storage Security Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /papers/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null 
           && request.resource.size < 10 * 1024 * 1024 
           && request.resource.contentType.matches('application/pdf');
       }
     }
   }
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:5173`

## Vercel Deployment

When deploying to Vercel, make sure to add the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the required environment variables:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Make sure to add any other environment variables your app needs (email configuration, etc.)
5. Redeploy your application after setting up the environment variables

### Important: Authorized Domains for Firebase Authentication

To fix the "auth/unauthorized-domain" error when using Google Sign-In:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add your Vercel domain (e.g., `your-app.vercel.app`) to the list of authorized domains
5. Save changes

This will allow Google authentication to work properly on your deployed Vercel site.

## Project Structure 📁

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Main navigation bar
│   └── DashboardSidebar.tsx # Dashboard sidebar
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Browse.tsx      # Paper browsing page
│   ├── Upload.tsx      # Paper upload page
│   ├── Dashboard.tsx   # Main dashboard
│   └── dashboard/      # Dashboard sub-pages
│       ├── DashboardHome.tsx
│       ├── MyUploads.tsx
│       ├── UploadPaper.tsx
│       ├── LikedPapers.tsx
│       └── Settings.tsx
├── services/           # API and external services
│   ├── firebase.ts     # Firebase configuration
│   ├── upload.ts       # File upload service
│   └── papers.ts       # Paper management service
└── utils/              # Utility functions
```

## Database Schema 🗄️

### Collections

**users**
```typescript
{
  uid: string;
  name: string;
  email: string;
  college: string;
  semester: string;
  course: string;
  role: 'student' | 'admin';
  createdAt: Date;
}
```

**papers**
```typescript
{
  id: string;
  title: string;
  subject: string;
  course: string;
  semester: string;
  examType: string;
  description?: string;
  uploaderId: string;
  uploaderName: string;
  status: 'pending' | 'approved' | 'rejected';
  likeCount: number;
  downloadCount: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}
```

**likes**
```typescript
{
  id: string;
  paperId: string;
  userId: string;
  createdAt: Date;
}
```

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment 🚀

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## Roadmap 🗺️

### Phase 2 (Next)
- [ ] Admin panel for content moderation
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Paper categories and tags
- [ ] User ratings and reviews

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] AI-powered paper analysis
- [ ] OCR for paper content
- [ ] Social features (comments, sharing)
- [ ] Analytics dashboard

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for students everywhere**

[Live Demo 🚀](https://study-vault-gamma.vercel.app/)
