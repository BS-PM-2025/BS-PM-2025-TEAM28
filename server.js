const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');

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
      UserType VARCHAR(50) NOT NULL
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

app.post('/api/register', async (req, res) => {
  const { name, email, password, userType } = req.body;
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

    const insertQuery = `
      INSERT INTO Users (Name, Gmail, Password, UserType)
      VALUES (@name, @email, @password, @userType)
    `;

    await request.query(insertQuery);
    console.log('✅ User inserted successfully');
    res.status(200).send('User registered successfully');
  } catch (err) {
    console.error('❌ DB insert error:', err);
    res.status(500).send('Server error');
  }
});
/////////////////////////////////////////////log in///////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////
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
