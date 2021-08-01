
const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()
const port = 5000
// const uri = "mongodb+srv://my-emajohn-user:11559988@cluster0.7xwek.mongodb.net/my-emajhon?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xwek.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

  const productCollection = client.db("my-emajhon").collection("product");
  const sellerCollection = client.db("my-emajhon").collection("seller");
  const bidsCollection = client.db("my-emajhon").collection("bids");
  console.log('connection err', err)


  app.get('/products', (req, res) => {
    productCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })
  app.get('/bids', (req, res) => {
    bidsCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })
  // app.post("/bids", (req, res) => {
  //   const email = req.body.email;
  //   console.log(email);
  
  //   bidsCollection.filter({ email: email }).toArray((err, admin) => {
  //     res.send(admin.length > 0);
  //   });
  // });


  app.post('/addProduct', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const duration = req.body.duration;
    const price = req.body.price;
    const seller = req.body.seller;
    const sellerEmail = req.body.sellerEmail;
    const bestPrice = +req.body.bestPrice;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
   
    productCollection
      .insertOne({ name, description, image, price,duration ,seller,sellerEmail,bestPrice,bestPrice})
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  })


  app.patch("/update/:id", (req, res) => {
    const newCondition = req.body.status;
  console.log(newCondition,'clg ');
   productCollection
   .updateOne(
        { _id: ObjectID(req.params.id) },
  
        {
          $set: { bestPrice : newCondition },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });



  app.post("/addBtd",(req,res)=>{
    const newbids= req.body;
    console.log(newbids);
    bidsCollection.insertOne(newbids)
    .then((result)=>{
      res.send(result.insertedCount>0)
    })
  })


  app.delete('deleteEvent/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete this', id);
    productCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(!!documents.value))
  })


});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port);




