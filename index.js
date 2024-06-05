const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000


// middleware

app.use(cors())
app.use(express.json())

console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.myfy8om.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const studySessionCollection = client.db('Assignment-12').collection('studySession')

        // Get Method For See all Study session

        app.get('/studySession', async (req, res) => {
            const cursor = studySessionCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get method Study Session Detail by id

        app.get('/studySession/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await studySessionCollection.findOne(query)
            res.send(result)
        })


        // post method for send review to the server

        const reviewCollection = client.db('Assignment-12').collection('review')

        app.post('/review', async (req, res) => {
            const newReview = req.body
            console.log(newReview)
            const result = await reviewCollection.insertOne(newReview)
            res.send(result)
        })

        // Get method for show review on ui

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find()
            const result = await cursor.toArray()
            res.send(result)
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



/////////////////////////////

app.get('/', (req, res) => {
    res.send('Assignment 12 Server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})