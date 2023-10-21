require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wmyy1wk.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db('productDb').collection('Product');
    const brandsCollection = client.db('productDb').collection('Brand');
    const addToCardCollection = client.db('cardDb').collection('Card');


    app.get('/products', async (req, res) => {
        const query = {};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
    })

    app.get('/products/:name', async (req, res) => {
      const name = req.params.name;
      const cursor = productsCollection.find({ brand: name }); 
      const products = await cursor.toArray();
      res.send(products);
  });

  app.get('/products/:brand/:id', async (req, res) => {
    const brand = req.params.brand;
    const id = req.params.id;
    const query = { brand: brand, _id: id };
    const cursor = productsCollection.find(query);
    const products = await cursor.toArray();
    res.send(products);
  });



  app.put('/products/:brand/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id:new ObjectId(id)};
    const options = { upsert: true };
    const updatedData = req.body;
    const updateDoc = {
      $set: { 
        brand: updatedData.brand,
        name: updatedData.name,
        price: updatedData.price,
        quantity: updatedData.quantity,
        image: updatedData.image,
        category: updatedData.category,
        rating: updatedData.rating,
      },
        
      };

      const result = await productsCollection.updateOne(query, updateDoc, options);
      res.send(result);

    }
  
  );






  app.get('/cards', async (req, res) => {
    const query = {};
    const cursor = addToCardCollection.find(query);
    const products = await cursor.toArray();
    res.send(products);
})

//   app.post('/cards', async (req, res) => {
//     const card = req.body;
    
//     // Check if a card with the same properties already exists
//     const existingCard = await addToCardCollection.findOne({
//       property1: card.property1,
//       property2: card.property2
//       // Add more conditions for other properties if needed
//     });

//     if (existingCard) {
//       res.status(400).json({ message: 'Card already exists' });
//     } else {
//       const result = await addToCardCollection.insertOne(card);
//       console.log(result);
//       res.status(201).json({ acknowledged: true });
//     }
//  });


app.post('/cards', async (req, res) => {
  const card = req.body;
  console.log(card);
  const result = await addToCardCollection.insertOne(card);
  console.log(result);
  res.send(result);
})


  app.delete('/cards/:id', async (req, res) => {
            const id = req.params.id; 
            const query = {_id: new ObjectId(id) }
            const result = await addToCardCollection.deleteOne(query);
            res.send(result);
        })

  // app.delete('/cards/:id', async (req, res) => {
  //   const id = req.params.id;
  //   const query = { _id: new ObjectId(id) };
  
  //   try {
  //     const result = await addToCardCollection.deleteOne(query);
  //     if (result.deletedCount > 0) {
  //       res.json({ message: 'Deletion successful' });
  //     } else {
  //       res.status(404).json({ message: 'No document found to delete' });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'An error occurred during deletion' });
  //   }
  // });
  

  
  
   

    app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        console.log(result);
        res.send(result);
    })

    app.post('products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query); 
      res.send(result);
    })



    app.get('/brands', async (req, res) => {
       
        const cursor = brandsCollection.find();
        const brands = await cursor.toArray();
        res.send(brands);
    })
    app.post('/brands', async (req, res) => {
        const brand = req.body;
        const result = await brandsCollection.insertOne(brand);
        console.log(result);
        res.send(result);
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})