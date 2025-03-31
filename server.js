const express = require('express')
const app = express();
require('dotenv').config();
const db = require('./db');

//const passport = require('./auth');

//.env for password
//require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


// import the router files
const userRoutes = require('./routes/userRoutes');
const partyCandidateRoutes = require('./routes/partyCandidateRoutes');


// use of router
app.use('/user', userRoutes);
app.use('/partyCandidate' ,partyCandidateRoutes);



app.listen(PORT, () => { console.log(" Server Running on port 3000 ")});
