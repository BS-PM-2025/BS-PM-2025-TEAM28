const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  server: 'localhost',
  port: 1433,
  user: 'fms_user',
  password: 'fms1234',
  database: 'FMS',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const createUsersTableIfNotExists = async () => {
  const query = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
    CREATE TABLE Users (
      ID INT IDENTITY(1,1) PRIMARY KEY,
      Name NVARCHAR(255) NOT NULL,
      Gmail NVARCHAR(255) NOT NULL,
      Password NVARCHAR(255) NOT NULL,
      UserType VARCHAR(50) NOT NULL,
      IsAdmin BIT DEFAULT 0
    );
  `;

  try {
    console.log('🔧 Creating Users table if not exists...');
    await sql.query(query);
    console.log('✅ Users table created or already exists.');
  } catch (err) {
    console.error('❌ Error creating Users table:', err);
  }
};

// 🚀 Email config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'onlinelibrary6565@gmail.com',
    pass: 'vvve zugz mvbg wjmz',
  },
    tls: {
    rejectUnauthorized: false,
  },
});

// 🧠 In-memory storage for reset codes
const resetCodes = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ➕ Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, userType, isAdmin } = req.body;
  console.log('📩 Register request received:', req.body);

  if (!name || !email || !password || !userType) {
    console.log('⚠️ Missing fields');
    return res.status(400).send('All fields are required');
  }

  try {
    const request = new sql.Request();
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, password);
    request.input('userType', sql.VarChar, userType);
    request.input('isAdmin', sql.Bit, isAdmin || 0);

    const insertQuery = `
      INSERT INTO Users (Name, Gmail, Password, UserType, IsAdmin)
      VALUES (@name, @email, @password, @userType, @isAdmin)
    `;

    await request.query(insertQuery);
    console.log('✅ User inserted successfully');
    res.status(200).send('User registered successfully');
  } catch (err) {
    console.error('❌ DB insert error:', err);
    res.status(500).send('Server error');
  }
});

// 🔐 Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', req.body);

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, password);

    const result = await request.query(`
      SELECT * FROM Users
      WHERE Gmail = @email AND Password = @password
    `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.status(200).json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Server error');
  }
});

// 📧 Send reset code
app.post('/api/send-reset-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ message: 'Email is required' });

  try {
    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);
    const result = await request.query(`SELECT * FROM Users WHERE Gmail = @email`);

    if (result.recordset.length === 0) return res.status(404).send({ message: 'User not found' });

    const code = generateCode();
    resetCodes.set(email, code);

    const mailOptions = {
      from: 'FMS <onlinelibrary6565@gmail.com>',
      to: email,
      subject: 'FMS - Your Password Reset Code',
      text: `Hello from FMS!\n\nYour reset code is: ${code}\n\nUse it in the app to reset your password.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email send error:', error); 
        return res.status(500).send({ message: 'Failed to send email' });
      } else {
        console.log('✅ Email sent:', info.response);
        res.send({ message: 'Reset code sent to your email' });
      }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

// 🔁 Reset password
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const validCode = resetCodes.get(email);

  if (!validCode || code !== validCode) {
    return res.status(400).send({ message: 'Invalid or expired code' });
  }

  try {
    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);
    request.input('newPassword', sql.NVarChar, newPassword);
    await request.query(`UPDATE Users SET Password = @newPassword WHERE Gmail = @email`);

    resetCodes.delete(email);
    res.send({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

// 🚀 Start server
const startServer = async () => {
  try {
    await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server');
    await createUsersTableIfNotExists();

    app.listen(3000, '0.0.0.0', () => {
      console.log('🚀 Server running on all interfaces at port 3000');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
