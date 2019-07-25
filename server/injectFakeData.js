const faker = require('faker');

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
  id: Number,
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

const item = mongoose.model('Item', itemSchema);
const cartList = mongoose.model('Cart', cartSchema);
const usersList = mongoose.model('UserList', usersSchema);
const userViews = mongoose.model('UserViews', userViewsSchema);


async function save (start) {
  let end = start + 100000
  let items =[];
  for (let index = start; index < end; index++) {
    const newItem = new item({
      id: index,
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      category: faker.commerce.department()
    })
    items.push(newItem);
  }
  item.collection.insertMany(items).then((result) => {
    console.log(`saved 100000 more! from ${start} to ${end-1}`);
    if(start < 10000000) {
      save(end);
    } else {
      console.timeEnd('performance')
    }
  }).catch((err) => {
    console.log('ERROR: ', err);
  })
}
console.time('performance')
save(1);