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

const userSchema = new mongoose.Schema({
	username: String,
	_id: String
});

let users = mongoose.model('users', userSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/users', async (req, res) => {
	let username = req.body.username;
	let userid = crypto.createHash('sha256').update(username + Date.now().toString()).digest('hex').slice(0, 16);
	
	let user = await users.create({username: username, _id: userid});
	
	res.json({username: username, _id: user._id})
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
