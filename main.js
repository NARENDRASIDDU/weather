const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const admin = require('firebase-admin');
const serviceAccount = require('./key.json');
const axios = require('axios');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/signup', function (req, res) {
  res.render('signup');
});
app.get('/login', function (req, res) {
  res.render('login');
});
app.post('/signupSubmit', async function (req, res) {
  try {
    const { Fullname, Email, Phoneno, Password } = req.body;
    // Hash the password before storing it
    // Store user data in Firestore
    await db.collection('userDemo').add({
      Fullname,
      Email,
      Phoneno,
      Password, // Hash the password before storing it
    });
    res.render("login");
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Signup failed');
  }
});

app.post('/loginSubmit', async function (req, res) {
  try {
    const { Email, Password } = req.body;
    const snapshot = await db
      .collection('userDemo')
      .where('Email', '==', Email)
      .where('Password', '==', Password) // Hashed password comparison
      .get();
    if (!snapshot.empty) {
      res.redirect("weather");
    } else {
      res.send('Login failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Login failed');
  }
});


app.get('/weather', async function (req, res) {
  try {
    const apiKey = '71afd29f2cd840919b4101249232907';
    const city = req.query.city || 'New York';

    const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
    const weatherData = weatherResponse.data;

    res.render('weather', { weather: weatherData, city });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});