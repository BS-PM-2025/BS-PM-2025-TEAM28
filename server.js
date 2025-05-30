const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

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
    console.log('Creating Users table if not exists...');
    await sql.query(query);
    console.log('Users table created or already exists.');
  } catch (err) {
    console.error('Error creating Users table:', err);
  }
};

const createSheltersTableIfNotExists = async () => {
  const query = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Shelters' AND xtype='U')
    CREATE TABLE Shelters (
      ID INT IDENTITY(1,1) PRIMARY KEY,
      Name NVARCHAR(255) NOT NULL,
      Address NVARCHAR(255),
      Latitude DECIMAL(10, 8) NOT NULL,
      Longitude DECIMAL(11, 8) NOT NULL,
      Capacity INT,
      Status NVARCHAR(50) DEFAULT 'Active'
    );
  `;

  try {
    console.log('Creating Shelters table if not exists...');
    await sql.query(query);
    console.log('Shelters table created or already exists.');
  } catch (err) {
    console.error('Error creating Shelters table:', err);
  }
};

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

const resetCodes = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
///////////////////////////////////register//////////////////////////////////////
app.post('/api/register', async (req, res) => {
  const { name, email, password, userType, isAdmin } = req.body;
  console.log('Register request received:', { name, email, userType });

  if (!name || !email || !password || !userType) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name must be at least 2 characters long' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please enter a valid email address' 
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  try {
    const checkRequest = new sql.Request();
    checkRequest.input('email', sql.NVarChar, email);
    
    const checkResult = await checkRequest.query(`
      SELECT COUNT(*) as count 
      FROM Users 
      WHERE Gmail = @email
    `);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is already registered' 
      });
    }

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
    console.log('User registered successfully:', { name, email, userType });
    res.status(200).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////login///////////////////////////////////////
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', req.body);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
      SELECT ID, Name, Gmail, Password, UserType, IsAdmin 
      FROM Users 
      WHERE Gmail = @email
    `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      
      if (password === user.Password) {
        console.log('Login successful for user:', user.Name);
        res.status(200).json({ 
          success: true, 
          user: {
            ID: user.ID,
            Name: user.Name,
            Gmail: user.Gmail,
            UserType: user.UserType,
            IsAdmin: user.IsAdmin === 1 || user.IsAdmin === true || user.IsAdmin === '1'
          }
        });
      } else {
        console.log('Login failed: Invalid password');
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      console.log('Login failed: User not found');
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
////////////////////////////////////////////////////////////////////////////

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
        console.error('Email send error:', error); 
        return res.status(500).send({ message: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.send({ message: 'Reset code sent to your email' });
      }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});
///////////////////////////users/////////////////////////////////

app.get('/api/users', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query('SELECT ID, Name, Gmail FROM Users');
    res.status(200).json({ users: result.recordset });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    await request.query('DELETE FROM Users WHERE ID = @id');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
/////////////////////////////////////////////////////////////////////////
///////////////////////////shelters//////////////////////
app.get('/api/shelters', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT ID, Name, Latitude, Longitude
      FROM [FMS].[dbo].[Shelters]
    `);

    console.log('Fetched shelters:', result.recordset);

    res.json({ 
      success: true, 
      shelters: result.recordset 
    });
  } catch (err) {
    console.error('Error fetching shelters:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch shelters',
      error: err.message 
    });
  }
});
app.delete('/api/shelters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    await request.query('DELETE FROM Shelters WHERE ID = @id');
    res.status(200).json({ message: 'Shelter deleted successfully' });
  } catch (error) {
    console.error('Error deleting shelter:', error);
    res.status(500).json({ message: 'Failed to delete shelter' });
  }
});
app.post('/api/shelters', async (req, res) => {
  const { Name, Latitude, Longitude } = req.body;
  try {
    const request = new sql.Request();
    request.input('Name', sql.NVarChar, Name);
    request.input('Latitude', sql.Float, Latitude);
    request.input('Longitude', sql.Float, Longitude);
    await request.query(`
      INSERT INTO Shelters (Name, Latitude, Longitude)
      VALUES (@Name, @Latitude, @Longitude)
    `);
    res.status(200).json({ message: 'Shelter added successfully' });
  } catch (error) {
    console.error('Error adding shelter:', error);
    res.status(500).json({ message: 'Failed to add shelter' });
  }
});
//////////////////////////////////////////

///////////reset password ////////////////////////////////////////
app.post('/api/reset-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  try {
    const request = new sql.Request();
    request.input('email', sql.NVarChar, email);
    const result = await request.query(`SELECT * FROM Users WHERE Gmail = @email`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.recordset[0];
    if (currentPassword !== user.Password) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const updateRequest = new sql.Request();
    updateRequest.input('email', sql.NVarChar, email);
    updateRequest.input('newPassword', sql.NVarChar, newPassword);
    
    await updateRequest.query(`
      UPDATE Users 
      SET Password = @newPassword 
      WHERE Gmail = @email
    `);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

app.post('/api/reset-password-with-code', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  try {
    const storedCode = resetCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return res.status(401).json({ success: false, message: 'Invalid reset code' });
    }

    const updateRequest = new sql.Request();
    updateRequest.input('email', sql.NVarChar, email);
    updateRequest.input('newPassword', sql.NVarChar, newPassword);
    
    await updateRequest.query(`
      UPDATE Users 
      SET Password = @newPassword 
      WHERE Gmail = @email
    `);

    resetCodes.delete(email);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Directions endpoint
app.get('/api/directions', async (req, res) => {
  try {
    const { origin, destination, mode = 'walking' } = req.query;
    
    console.log('\n=== DIRECTIONS REQUEST ===');
    console.log('Raw origin:', origin);
    console.log('Raw destination:', destination);
    console.log('Travel mode:', mode);
    
    if (!origin || !destination) {
      console.log('Missing parameters:', { origin, destination });
      return res.status(400).json({ 
        success: false, 
        error: 'Origin and destination are required' 
      });
    }

    // Validate travel mode
    const validModes = ['walking', 'driving', 'transit', 'bicycling'];
    const travelMode = validModes.includes(mode) ? mode : 'walking';

    // Parse coordinates
    const [originLat, originLng] = origin.split(',').map(Number);
    const [destLat, destLng] = destination.split(',').map(Number);

    console.log('\n=== PARSED COORDINATES ===');
    console.log('Origin:', { lat: originLat, lng: originLng });
    console.log('Destination:', { lat: destLat, lng: destLng });
    console.log('Using travel mode:', travelMode);

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      console.error('Invalid coordinate format');
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates format'
      });
    }

    console.log('\n=== MAKING GOOGLE MAPS REQUEST ===');
    const googleMapsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=${travelMode}&key=AIzaSyDbv7vak9FAXNNZTPyqfIaxY9R2TGvy99o&region=il`;
    console.log('URL:', googleMapsUrl);

    const response = await axios.get(googleMapsUrl);
    console.log('\n=== GOOGLE MAPS RESPONSE ===');
    console.log('Status:', response.data.status);
    
    if (response.data.status === 'OK') {
      const route = response.data.routes[0];
      console.log('\n=== ROUTE DETAILS ===');
      console.log('Start location:', route.legs[0].start_location);
      console.log('End location:', route.legs[0].end_location);
      console.log('Travel mode:', travelMode);
      console.log('Duration:', route.legs[0].duration.text);
      
      res.json({ 
        success: true, 
        route: response.data 
      });
    } else {
      console.error('Google Maps API error:', response.data);
      res.status(400).json({ 
        success: false, 
        error: response.data.status,
        message: response.data.error_message || 'Failed to get directions'
      });
    }
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error details:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch directions',
      message: error.response?.data?.error_message || error.message
    });
  }
});

const startServer = async () => {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to database');
    
    await createUsersTableIfNotExists();
    await createSheltersTableIfNotExists();
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();
