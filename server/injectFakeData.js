const fake = require('faker');

const config = require('../config.js');
const mongoose = require('mongoose');

// mongoose.connect(`mongodb+srv://Michael:${config.MONGO}@cluster0-ibbip.mongodb.net/homedepot?retryWrites=true&w=majority`);
mongoose.connect('mongodb://localhost/SDC', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected!')
});

let itemSchema = mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String
});

const cartSchema = mongoose.Schema({
  cookie: String,
  username: String,
  id: Number,
  price: Number,
  name: String,
  quantity: Number
})

const usersSchema = mongoose.Schema({
  username: String,
  password: String,
  sessionCookie: String
})

const userViewsSchema = mongoose.Schema({
  username: String,
  cookie: String,
  id: Number
})

const itemList = mongoose.model('ItemList', itemSchema);
const cartList = mongoose.model('Cart', cartSchema);
const usersList = mongoose.model('UserList', usersSchema);
const userViews = mongoose.model('UserViews', userViewsSchema);