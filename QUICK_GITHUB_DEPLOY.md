# 🚀 Quick GitHub Pages Deployment

## ✅ Step-by-Step (15 minutes total)

---

## 📍 **Part 1: Backend Setup (10 min)**

### 1. MongoDB Atlas
```
1. https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Create user: admin / (strong password)
4. Allow IP: 0.0.0.0/0
5. Copy connection string
```

### 2. Render.com
```
1. https://render.com (Sign up with GitHub)
2. New + → Web Service
3. Select: SKS_Class_7TH
4. Name: sks-school-management
5. Runtime: Node
6. Build: npm install
7. Start: npm start
8. Plan: FREE
```

### 3. Environment Variables
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = (your MongoDB string)
JWT_SECRET = (random string)
```

### 4. Create Admin
```javascript
// Browser console mein paste karo:
fetch('https://sks-school-management.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    fullName: 'Admin User',
    phone: '1234567890',
    address: 'School Address'
  })
}).then(r => r.json()).then(console.log)
```

---

## 📍 **Part 2: Frontend Setup (5 min)**

### 1. Push to GitHub
```bash
git add .
git commit -m "School Management System"
git push origin main
```

### 2. Enable GitHub Pages
```
1. GitHub repository → Settings
2. Pages (left sidebar)
3. Source: Deploy from branch
4. Branch: main
5. Folder: / (root)
6. Save
```

### 3. Wait & Test
```
Wait 2-3 minutes
Open: https://deeprajslodhi-creator.github.io/SKS_Class_7TH/
Login: admin / admin123
```

---

## ✅ **Done!**

**Frontend:** https://deeprajslodhi-creator.github.io/SKS_Class_7TH/
**Backend:** https://sks-school-management.onrender.com

---

## 🔧 **Important Files Updated:**

1. ✅ `public/js/api.js` - Points to Render backend
2. ✅ `server.js` - CORS allows GitHub Pages
3. ✅ `GITHUB_PAGES_DEPLOYMENT.md` - Full guide

---

## 📝 **Login Credentials:**

```
Username: admin
Password: admin123
Role: Admin
```

---

## 🐛 **Quick Fixes:**

**Frontend not loading?**
- Wait 2-3 minutes
- Check GitHub Pages settings
- Clear browser cache

**Backend not responding?**
- Wait 30-60 seconds (free tier wakes up)
- Check Render logs
- Verify MongoDB connection

**CORS error?**
- Check server.js has GitHub Pages URL
- Redeploy backend on Render

---

## 🎉 **Success!**

Your app is now live on GitHub Pages with a working backend! 🚀

For detailed guide, check: `GITHUB_PAGES_DEPLOYMENT.md`
