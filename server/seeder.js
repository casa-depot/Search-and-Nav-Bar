const faker = require('faker');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/casadepot', {useNewUrlParser: true}).catch((err) => {
  console.log(err);
});
const Schema = mongoose.Schema;
let itemListSchema = new Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  view: Number,
  keywords: Array
})
const itemList = mongoose.model('itemList', itemListSchema, 'items');
// itemListSchema.index({keywords: 'text', views: -1})
// console.log('done?');

function save (start) {
  let end = start + 100000
  let items =[];
  for (let index = start; index < end; index++) {
    const newItem = {
      id: index,
      name: faker.commerce.productName(),
      price: faker.commerce.price(10),
      category: faker.commerce.department(),
      views: faker.random.number(10000),
      keywords: []
    }
    newItem.keywords = newItem.name.split(' ').map((keyword) => {
      let arr = [];
      for (let i = 0; i < keyword.length; i++) {
        arr.push(keyword.toUpperCase().substring(0, 1+i));
      }
      return arr
    })
    newItem.keywords = [].concat.apply([], newItem.keywords);
    items.push(newItem);
  }

  itemList.collection.insertMany(items)
  .then((result) => {
  if(end > 10000000) {
    return mongoose.connection.close()
  } else {
    console.log(`saved 1000000 more! from ${start} to ${end-1}`);
    save(end);
  }
  })
  .catch((err) => {
    console.log('ERROR: ', err);
  })
}

save(1);