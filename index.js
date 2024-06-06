const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://assignment-12-fb293.web.app",
            "https://assignment-12-fb293.firebaseapp.com",
        ],
    })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.myfy8om.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        // all collection 

        const studySessionCollection = client.db('Assignment-12').collection('studySession');

        const reviewCollection = client.db('Assignment-12').collection('review');

        const noteCollection = client.db('Assignment-12').collection('note');

        const userCollection = client.db('Assignment-12').collection('user');


        // Jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({ token })
        });

        // middlewares
        const verifyToken = (req, res, next) => {
            console.log('inside verify Token', req.headers.authorization)
            if (!req.headers.authorization) {
                return res.status(401).send({ massage: 'forbidden access' })
            }

            const token = req.headers.authorization.split(' ')[1]

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ massage: 'forbidden access' })
                }
                req.decoded = decoded
                next()
            })
        }

        // Get Method For See all Study sessions
        app.get('/studySession', async (req, res) => {
            const cursor = studySessionCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get method Study Session Detail by id
        app.get('/studySession/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await studySessionCollection.findOne(query);
            res.send(result);
        });

        // Post method for sending review to the server
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            console.log(newReview);
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        });

        // Get method for showing reviews on UI
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Post method for sending note to the server
        app.post('/note', async (req, res) => {
            const newNote = req.body;
            console.log(newNote);
            const result = await noteCollection.insertOne(newNote);
            res.send(result);
        });

        // Get method for showing note on UI
        app.get('/note', async (req, res) => {
            const cursor = noteCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Post method for sending user info to the server
        app.post('/user', async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const query = { email: newUser.email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                return res.send({ massage: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        // Get method for showing all user on UI
        app.get('/user', verifyToken, async (req, res) => {
            console.log(req.headers);
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // patch method for update user role on UI
        app.patch('/user/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        //// check admin ////

        app.get('/user/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Assignment 12 Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
