# CloudBox - Quick Start Guide 🚀

Welcome to **CloudBox**, your premium cloud storage application!

---

## 📱 **Application Pages**

### 1. **Login Page** (`login.html`)
- Start here - your gateway to the app
- Clean authentication interface
- Redirects to main dashboard after login

### 2. **Registration Page** (`register.html`)
- New user signup
- Validates email and password
- Offers 20GB free storage

### 3. **Dashboard** (`index.html`) 
- **Main homepage** after login
- Shows Quick Access cards (Music, Images, Videos, Docs)
- Recent Files table
- Upload button -> Opens drag & drop modal
- Storage usage widget in sidebar

### 4. **My Files** (`files.html`)
- Complete file browser
- Folder categories
- Comprehensive file listing
- Upload functionality

### 5. **Profile/Settings** (`profile.html`)
- User profile management
- Account settings form
- Security options
- App preferences

### 6. **Storage & Pricing** (`storage.html`)
- View available plans (Basic, Pro, Team)
- Pricing comparison
- Upgrade options

---

## ✨ **Key Features**

### 🎨 **Theme System**
-Click the **Moon/Sun icon** in the top- bar
- Switches between Light & Dark modes
- Selection saved in localStorage

### 📤 **File Upload**
1. Click "New Upload" button
2. Upload modal appears
3. **Drag & drop** files OR click "Browse"
4. Files appear in table with animation

### 🔐 **Logout**
- Click "Logout" in sidebar
- Confirmation dialog appears
- Returns to login page

### 📱 **Mobile Responsive**
- **Desktop**: Full sidebar + content
- **Tablet (900px)**: Icon-only sidebar
- **Mobile (768px)**: Hamburger menu

---

## 🎯 **User Flow**

```
login.html (Start)
    ↓
index.html (Dashboard)
    ├→ files.html (Browse all files)
    ├→ profile.html (Settings)
    ├→ storage.html (Upgrade)
    └→ login.html (Logout)
```

---

## 🛠️ **Testing the App**

### Open in Browser
1. Double-click `login.html`
2. Or open with: `Ctrl + O` → Select `login.html`

### Test Flow
1. ✅ Login page loads
2. ✅ Click form submit → Go to `index.html`
3. ✅ Toggle theme (Moon/Sun icon)
4. ✅ Click "New Upload" → Modal appears
5. ✅ Drag file → Adds to table
6. ✅ Navigate to "My Files" → `files.html` loads
7. ✅ Go to Profile → `profile.html` loads
8. ✅ Click "Save Changes" → Alert appears
9. ✅ Visit Storage page → Pricing cards show
10. ✅ Click Logout → Confirmation → Returns to login

---

## 🐛 **Troubleshooting**

### Icons not loading?
- Check internet connection (FontAwesome CDN)
- Reload page

### Theme not saving?
- Enable localStorage in browser
- Check browser console for errors

### Files not uploading?
- This is a **front-end simulation only**
- Real backend needed for actual storage

### Mobile menu not working?
- Check screen width < 768px
- Click hamburger icon (top-left)

---

## 📂 **File Structure**

```
SKS_Class_7TH/
├── index.html          (Dashboard - START HERE)
├── login.html          (Authentication)
├── register.html       (Sign up)
├── files.html          (File browser)
├── profile.html        (User settings)
├── storage.html        (Pricing)
├── style.css           (Complete styling)
├── script.js           (Interactive logic)
└── README.md           (Full documentation)
```

---

## ⚡ **Performance Tips**

- **Fast Loading**: No external frameworks
- **Smooth Animations**: Hardware-accelerated CSS
- **Optimized**: Vanilla JS for speed

---

## 🎨 **Customization**

### Change Brand Color:
Edit `style.css` line 10:
```css
--accent-color: #4f46e5; /* Your color */
```

### Add New Page:
1. Copy any `.html` file
2. Update content
3. Add link in sidebar

---

## 📌 **Important Notes**

⚠️ **This is a Front-End Demo**
- No real authentication system
- Files are simulated (not actually stored)
- For educational/UI demonstration purposes

✅ **For Production Use:**
- Add backend (Node.js, Firebase, etc.)
- Implement real auth (JWT, OAuth)
- Connect to cloud storage (AWS S3, etc.)
- Add database (MongoDB, PostgreSQL)

---

## 🚀 **Next Steps**

1. Open `login.html` in your browser
2. Explore all pages
3. Test dark/light themes
4. Try uploading files
5. Check responsiveness (resize window)

---

## 💡 **Tips**

- **Best viewed in**: Chrome, Firefox, Edge (latest)
- **Recommended resolution**: 1920x1080 or higher
- **Mobile testing**: Use browser DevTools (F12)

---

**Enjoy CloudBox! 🎉**

For full documentation, see `README.md`
