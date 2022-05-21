require('dotenv').config()
const express=require('express');
const bodyParser=require('body-parser');
const cors = require('cors');
const backendApi = require('./app');

const {PORT} = process.env;
const app=express();

app.use(cors());

app.listen(PORT, function() {
	console.log(`Server is listening at http://localhost:${PORT}`);
});

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({extended: true}));

// Parses the text as json
app.use(bodyParser.json());

app.use('/home',(req,res) => {
    res.send("Hello from find my pet backend server");
})

app.use('/backendApi',backendApi);
