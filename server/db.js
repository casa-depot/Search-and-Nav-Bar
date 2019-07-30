const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const config = require('../config.js');
// const {Pool} = require('pg')
var conString = "postgres://DJ@localhost:5432/sdc";
// const db = new Pool({
//   connectionString: conString
// })


// mongoose.connect(`mongodb+srv://Michael:${config.MONGO}@cluster0-ibbip.mongodb.net/homedepot?retryWrites=true&w=majority`);
mongoose.connect('mongodb://mongo/casadepot', {useNewUrlParser: true}).catch((err) => {
  console.log(err);
});


// const db = mongoose.connection;
const Schema = mongoose.Schema;
const saltRounds = 10;

let itemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
}, {
  collection: 'items'
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

const itemList = mongoose.model('itemList', new Schema({}), 'items');
const cartList = mongoose.model('Cart', cartSchema);
const usersList = mongoose.model('UserList', usersSchema);
const userViews = mongoose.model('UserViews', userViewsSchema);

// const save = () => {
//   allItems.map((newItem)=>{
//     const item = new itemList(newItem);
//     item.save(() => {
//       console.log('item saved to database');
//     })
//   })
// }

const addToCart = (item, cb) => {
  let cart = new cartList({
    cookie: item.cookie,
    username: item.item.username,
    id: item.item.id,
    price: item.item.price,
    name: item.item.name,
    quantity: item.item.quantity
  });
  cartList.find({cookie: item.cookie, id: item.item.id})
  .then((res) => {
    if (res.length === 0){
      cart.save(() => {cb('item saved')})
    } else {
      item.item.quantity += res[0].quantity
      cartList.updateOne({_id: res[0]._id}, {quantity: item.item.quantity})
      .then(()=> cb('updated item quantity'))
    }
  })
}

const getAll = (cb) => {
  itemList.find()
  .then((data) => cb(data))
}

const getAllandCart = (creds, cookie, cb) => {
  console.log('here ', creds.keyword);
  itemList.find({$text : {$search: creds.keyword} , views: { $gt: 600}}).limit(10)
  .then((data) => {
    console.log(data);
    usersList.find({sessionCookie:cookie})
    .then((users) => {
      let login = {name: '', previouslyViewed: [], showLoginScreen: false, error: ''};
      if (users.length !== 0){
        login.name = users[0].username;
        cartList.find({$or:[{username:login.name}, {cookie: cookie}]})
        .then((results) => {
          console.log(results)
          results.map((item) => login.previouslyViewed.push(item.id))
          cb(data, results, login);
        })
      } else {
      cartList.find({$or:[{username:creds.name}, {cookie: cookie}]})
      .then((results) => {
        cb(data, results, login);
      })
    }
    })
  })
}

// const getAllandCart = (creds, cookie, cb) => {
//   console.log('here ', creds.keyword);

//   // itemList.find({$text : {$search: creds.keyword} , views: { $gt: 600}}).limit(10)
//   db.query(`SELECT * from items WHERE name ILIKE '%${creds.keyword}%' ORDER BY views DESC LIMIT 10`)
//   .then((data) => {
//     console.log(data.rows);
//     usersList.find({sessionCookie:cookie})
//     .then((users) => {
//       let login = {name: '', previouslyViewed: [], showLoginScreen: false, error: ''};
//       if (users.length !== 0){
//         login.name = users[0].username;
//         cartList.find({$or:[{username:login.name}, {cookie: cookie}]})
//         .then((results) => {
//           console.log(results)
//           results.map((item) => login.previouslyViewed.push(item.id))
//           cb(data.rows, results, login);
//         })
//       } else {
//       cartList.find({$or:[{username:creds.name}, {cookie: cookie}]})
//       .then((results) => {
//         cb(data.rows, results, login);
//       })
//     }
//     })
//   })
// }

//login: {
//   name: '',
//   previouslyViewed: [],
//   showLoginScreen: false,
//   error: ''
// }

const newAccount = (creds, cookie, cb) => {
  if (creds.username.length < 4 || creds.password.length < 4){
    cb('4 character minimum for username and password');
    return;
  }
  usersList.find({username: creds.username})
  .then((data) => {
    if (data.length === 0){
      // bcrypt.hash(creds.password, saltRounds, function(err, hash) {
      //   let newUser = new usersList({
      //     username: creds.username,
      //     sessionCookie: cookie,
      //     password: hash
      //   })
      //   newUser.save(() => cb('Logged In'))
      // });
    } else {
      cb('username exists');
    }
  })
}

const login = (creds, cookie, cb) => {
  usersList.find({username: creds.username})
  .then((data) => {
    if (data.length === 0){
      cb('username does not exist');
      return;
    } else {
      // bcrypt.compare(creds.password, data[0].password, function(err, res) {
      //   if (res) {
      //     usersList.update({username: creds.username}, {sessionCookie: cookie})
      //     .then(() => cb('Logged In'))
      //   } else {
      //     cb('Password incorrect')
      //   }
      // });
    }
  })
}

const previousViews = (data, cookie, cb) => {
  if (!data.username){
    data.username = '';
  }
  let newView = new userViews({
    username: data.username,
    cookie: cookie,
    id: data.id
  })
  if (data.username === ''){
    userViews.find({cookie: cookie})
    .then((results) => {
    if (results.length){
      for (let i = 0; i < results.length; i++){
        if (results[i].id == data.id){
          cb('already in database');
          return;
        }
      }
      newView.save(() => cb('savedView'));
      return;
    }
    newView.save(() => cb('savedView'));
  })
  } else {
    userViews.find({$or:[{username:data.username}, {cookie: cookie}]})
    .then((results) => {
      if (results.length){
        for (let i = 0; i < results.length; i++){
          if (results[i].id === data.id){
            cb('already in database');
            return;
          }
        }
        newView.save(() => cb('savedView'));
        return;
      }
      newView.save(() => cb('savedView'));
    })
  }
}

const getUserViews = (cookie, cb) => {
  usersList.find({sessionCookie: cookie})
  .then((data) => {
    if (data.length){
      if (data[0].username){
        userViews.find({$or:[{username:data[0].username}, {cookie: cookie}]})
        .then((data) => {
          cb(data);
        })
      } else {
        userViews.find({cookie: cookie})
        .then((data) => {
          cb(data);
        })
      }
    } else {
      userViews.find({cookie: cookie})
        .then((data) => {
          cb(data);
        })
    }
  })
}

const deleteFromCart = (item, cb) => {
  cartList.deleteOne({cookie: item.cookie, id: item.item.id})
  .then((res) => {cb('item deleted')})
}

const checkout = (cookie, cb) => {
  cartList.deleteMany({cookie: cookie})
  .then(() => cb('checkout complete'))
}

const getCart = (creds, cookie, cb) => {
  cartList.find({username: creds.username})
  .then((results) => {
    cb(results);
  })
}

module.exports = { getAll, addToCart, getAllandCart, newAccount, login, previousViews, getUserViews, deleteFromCart, checkout, getCart };
