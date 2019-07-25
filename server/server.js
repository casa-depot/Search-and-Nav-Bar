const express = require('express');
const cookieParser = require('cookie-parser');
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const crypto = require("crypto");
const whitelist = ['http://homedepott.us-east-2.elasticbeanstalk.com', 'http://localhost:3000','http://localhost:3005','http://localhost:3050', 'http://ec2-18-217-166-165.us-east-2.compute.amazonaws.com', 'http://homedepot.us-east-2.elasticbeanstalk.com'];

const corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../dist')));
app.use(parser.json());


app.listen(3050, ()=>console.log('listening on port 3050'));

app.get('/allItems', (req, res) => {
  let newCookie = crypto.randomBytes(20).toString('hex')
  if (Object.keys(req.cookies).length){
    if (Object.keys(req.cookies.HomeDepotCookie)){
      db.getAllandCart(req.query, req.cookies.HomeDepotCookie, (data, cart, user) => {
        res.send({data: data, cart: cart, login: user})
      })} else {
        res.cookie('HomeDepotCookie', newCookie)
        db.getAllandCart(req.query, newCookie, (data, cart, user) => {
          res.send({data: data, cart: cart, login: user})
        })}
	} else {
    res.cookie('HomeDepotCookie', newCookie)
    db.getAllandCart(req.query, newCookie, (data, cart, user) => {
      res.send({data: data, cart: cart, login: user})
    })
  }
})

app.post('/addToCart', (req, res) => {
  db.addToCart({item: req.body.tempCart, cookie: req.cookies.HomeDepotCookie}, (response)=> {
    res.send(req.cookies)
  })
})

app.get('/checkout', (req, res) => {
  db.checkout((req.cookies.HomeDepotCookie), (data) => {
    res.send(data)
  })
  // res.cookie('HomeDepotCookie', req.cookies.HomeDepotCookie, {maxAge: 0});
  // res.cookie('HomeDepotCookie', crypto.randomBytes(20).toString('hex')).send()
});

app.get('/userLogin', (req, res) => {
  db.login(req.query, req.cookies.HomeDepotCookie, (response) => {
    res.send(response);
  })
})

app.post('/newAccount', (req, res) => {
  db.newAccount(req.body, req.cookies.HomeDepotCookie, (response) => {
    res.send(response);
  })
})

app.post('/previousViews', (req, res) => {
  db.previousViews(req.body, req.cookies.HomeDepotCookie,  (response) => {
    res.send(response)
  })
})

app.get('/getUserViews', (req, res) => {
  db.getUserViews(req.cookies.HomeDepotCookie, (data) => {
    res.send(data.slice(0, 12))
  })
})

app.get('/logout', (req, res) => {
  res.cookie('HomeDepotCookie', req.cookies.HomeDepotCookie, {maxAge: 0});
	res.cookie('HomeDepotCookie', crypto.randomBytes(20).toString('hex')).send()
})

app.post('/deleteFromCart', (req, res) => {
  db.deleteFromCart({item: req.body.item, cookie: req.cookies.HomeDepotCookie}, (response)=> {
    res.send(response);
  })
})

app.get('/getCart', (req, res) => {
  db.getCart(req.query, req.cookies.HomeDepotCookie, (data) => {
    res.send(data)
  })
})