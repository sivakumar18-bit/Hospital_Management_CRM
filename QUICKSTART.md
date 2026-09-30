# Quick Start Guide - 5 Minutes ⚡

## Prerequisites Checklist
- [ ] MySQL installed and running
- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] Terminal/Command Prompt access

## Steps

### 1. Database Setup (1 min)
```bash
mysql -u root -p < database/schema.sql
# Enter your root password when prompted
```

### 2. Backend Setup (2 min)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MySQL credentials
python app.py
```
**Expected**: Server runs on `http://localhost:5000`

### 3. Frontend Setup (1 min)
In a NEW terminal:
```bash
cd frontend
npm install
npm start
```
**Expected**: Browser opens at `http://localhost:3000`

### 4. First Login (1 min)
1. Click "Register" on login page
2. Create admin account
3. Login with your credentials
4. **Done!** 🎉

## Common Issues Quick Fixes

| Issue | Fix |
|-------|-----|
| MySQL not found | Ensure MySQL is installed and running |
| Port 5000 in use | Change port in `backend/app.py` |
| npm ERR! | Run `npm cache clean --force` then `npm install` again |
| Can't connect to DB | Check .env file credentials |

## Quick Test Flow

1. **Dashboard** - See statistics
2. **Register Patient** - Add new patient
3. **Patient List** - View all patients
4. **Patient Details** - Click a patient to view
5. **Emergency** - Mark patient as emergency
6. **Emergency List** - See emergency patients

---

**Questions?** See SETUP_GUIDE.md for detailed instructions.
