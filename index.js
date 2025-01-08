const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const crypto = require('crypto');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the user schema
const userSchema = new mongoose.Schema({
	username: String,
	_id: String
});

let User = mongoose.model('User', userSchema);

// Exercise Schema
const exoSchema = new mongoose.Schema({
	_id: String,
	username: String,
	userid: {type: String, unique: false},
	description: String,
	duration: Number,
	date: Date
});

let Exercise = mongoose.model('Exercise', exoSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /api/users endpoint
app.post('/api/users', async (req, res) => {
	let username = req.body.username;
	let userid = crypto.createHash('sha256').update(username + Date.now().toString()).digest('hex').slice(0, 16);
	
	let user = await User.create({username: username, _id: userid});
	
	res.json({username: username, _id: user._id})
});

app.get('/api/users', async (req, res) => {
	const users = await User.find();

	res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
	let exo = req.body;	
	let date;

	if (exo.date) {
		date = exo.date;
	} else {
		date = new Date();
	}

	let userid = req.params._id	
	let user = await User.findOne({_id: userid});
	if (!user) {
		return res.json({error: "User not found"});
	}
	let username = user.username;
	let _id = crypto.createHash('sha256').update(userid + Date.now().toString()).digest('hex').slice(0, 16);

	let exercise = await Exercise.create({
		_id: _id, 
		username: username, 
		userid: userid, 
		description: exo.description, 
		duration: exo.duration, 
		date: date});

	res.json({_id: userid, username: username, date: exercise.date.toDateString(), duration:exercise.duration, description: exercise.description});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
