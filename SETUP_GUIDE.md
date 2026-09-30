# Hospital Management CRM - Detailed Setup Guide

## System Requirements

- **OS**: Windows, macOS, or Linux
- **Python**: 3.8 or higher
- **Node.js**: 14.0 or higher
- **npm**: 6.0 or higher
- **MySQL**: 8.0 or higher
- **RAM**: Minimum 2GB
- **Disk Space**: 1GB free space

## Step-by-Step Installation

### 1. Install MySQL

**Windows:**
1. Download from https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow wizard
3. Note your root password
4. Open MySQL Command Line Client

**macOS:**
```bash
# Using Homebrew
brew install mysql
mysql.server start
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
mysql_secure_installation
```

### 2. Create Database

1. Open MySQL Client:
```bash
mysql -u root -p
# Enter your root password
```

2. Create the database:
```sql
CREATE DATABASE hospital_crm;
USE hospital_crm;
```

3. Import schema:
```bash
# From terminal (not in MySQL client)
mysql -u root -p hospital_crm < database/schema.sql
```

4. Verify tables:
```sql
SHOW TABLES;
```

### 3. Backend Setup

1. **Navigate to backend directory:**
```bash
cd hospital-crm/backend
```

2. **Create virtual environment (recommended):**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
# Copy example file
cp .env.example .env

# Edit .env file with your details
# For Windows, you can use Notepad or any text editor
# Important variables:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=hospital_crm
# JWT_SECRET_KEY=your-secret-key-here
```

5. **Test Flask application:**
```bash
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

Press `Ctrl+C` to stop.

### 4. Frontend Setup

1. **Open new terminal and navigate to frontend:**
```bash
cd hospital-crm/frontend
```

2. **Install dependencies:**
```bash
npm install
```

This may take 2-5 minutes.

3. **Verify installation:**
```bash
npm --version
node --version
```

4. **Configure API endpoint (if needed):**
- Open `src/services/api.js`
- Check that `API_BASE_URL = 'http://localhost:5000/api'` matches your backend

### 5. Running the Application

**Terminal 1 - Backend:**
```bash
cd hospital-crm/backend
# Activate virtual environment if not already active
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

**Terminal 2 - Frontend:**
```bash
cd hospital-crm/frontend
npm start
```

Expected output:
```
Compiled successfully!

You can now view hospital-crm-frontend in the browser.

  Local:            http://localhost:3000
```

### 6. First Time Usage

1. Open browser and go to `http://localhost:3000`
2. Click "Register" to create admin account
3. Fill in:
   - Full Name: Your Name
   - Email: admin@hospital.com
   - Password: yourpassword
4. Click "Register"
5. Login with your credentials
6. You're in! 🎉

## Troubleshooting

### "Connection refused" error

**Problem:** Cannot connect to database
**Solution:**
1. Verify MySQL is running
2. Check database credentials in .env
3. Ensure database was created

```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1"
```

### "Module not found" error (Python)

**Problem:** Missing Python dependencies
**Solution:**
```bash
# Make sure you're in backend directory
cd hospital-crm/backend
pip install -r requirements.txt
```

### "npm ERR!" during installation

**Problem:** npm installation issues
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Linux/macOS
rmdir /s node_modules  # Windows

# Reinstall
npm install
```

### Port 3000 or 5000 already in use

**Problem:** Port conflict
**Solution:**

For Flask (Backend):
```python
# In app.py, change:
app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 instead
```

For React (Frontend):
```bash
# Set PORT variable
PORT=3001 npm start  # macOS/Linux
set PORT=3001 && npm start  # Windows
```

### CORS errors

**Problem:** "Access to XMLHttpRequest has been blocked by CORS policy"
**Solution:**
1. Ensure Flask-CORS is installed: `pip install flask-cors`
2. Check API endpoint in `src/services/api.js`
3. Restart both servers

### MySQL errors after restart

**Problem:** "Lost connection to MySQL server"
**Solution:**

Windows:
```bash
# Start MySQL Service
net start MySQL80  # or your version
```

macOS:
```bash
mysql.server start
```

Linux:
```bash
sudo systemctl start mysql
```

## File Permissions

If you get permission denied errors on macOS/Linux:

```bash
chmod -R 755 hospital-crm/
chmod -R 755 hospital-crm/backend
chmod -R 755 hospital-crm/frontend
```

## Database Backup

To backup your database:

```bash
mysqldump -u root -p hospital_crm > backup.sql
```

To restore:

```bash
mysql -u root -p hospital_crm < backup.sql
```

## Development vs Production

### Development (Current Setup)
- Debug mode enabled
- CORS enabled
- Hot reloading
- Detailed error messages

### For Production:
1. Change Flask debug mode: `app.run(debug=False)`
2. Set JWT_SECRET_KEY to a strong random value
3. Use environment variables from system
4. Enable HTTPS
5. Use production database
6. Add rate limiting
7. Add logging

## Performance Tips

1. **Use indexes**: Database indexes are already set up
2. **Pagination**: Can be added to patient list for large datasets
3. **Caching**: Can be added for dashboard statistics
4. **Minify frontend**: `npm run build` for production

## Regular Maintenance

### Daily
- Monitor emergency alerts
- Check database size
- Review error logs

### Weekly
- Backup database
- Review patient registrations
- Check system performance

### Monthly
- Update dependencies
- Review security logs
- Optimize database

## Advanced Configuration

### Email Notifications (Optional)

To add email notifications for emergency alerts:

```python
# In app.py
from flask_mail import Mail, Message

mail = Mail(app)

def send_emergency_alert(patient):
    msg = Message('Emergency Alert', 
                  recipients=['admin@hospital.com'])
    msg.body = f'Patient {patient.patient_id} marked as emergency'
    mail.send(msg)
```

### SMS Notifications (Optional)

To add SMS notifications:

```python
# Install Twilio
# pip install twilio

from twilio.rest import Client

client = Client(account_sid, auth_token)
client.messages.create(
    body=f"Emergency Alert: Patient {patient_id}",
    from_="+1234567890",
    to="+0987654321"
)
```

## Getting Help

1. Check error logs in terminal
2. Review MySQL error log: `/var/log/mysql/error.log`
3. Check browser console (F12)
4. Verify all services are running
5. Review troubleshooting section

## Contact Support

For issues:
1. Document the error message
2. Note the steps to reproduce
3. Check system requirements
4. Review logs

---

**Setup Complete!** 🎉

Your Hospital Management CRM is now ready to use.
