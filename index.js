const express = require('express');
var cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
const app = express();

const port = process.env.PORT || 5000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
//const serviceAccount = require('./garir-bazar-firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwiso.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}

async function run() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const servicesCollection = database.collection(process.env.COLLECTION_NAME1);
        const ordersCollection = database.collection(process.env.COLLECTION_NAME2);
        const usersCollection = database.collection(process.env.COLLECTION_NAME3);
        const reviewsCollection = database.collection(process.env.COLLECTION_NAME4);

        //post api to add service
        app.post('/addService', async (req, res) => {
            const newUser = req.body;
            const filter = { id: newUser.id };
            console.log('new data : ', filter);
            const cursor = servicesCollection.find(filter);
            const service = await cursor.toArray();
            console.log(service);
            //if already have a service with this id, then no entry in DB
            if (service.length) {
                res.send('already have this id');
            }
            else {
                const result = await servicesCollection.insertOne(newUser);
                console.log(`Added user at index: ${result.insertedId}`);
                console.log('Success', result);
                res.json(result);
            }
        })

        // delete  api to delete a service 
        app.delete('/deleteService/:id', async (req, res) => {
            const id = req.params.id;
            console.log(' deleteService/id ', id);
            const query = { id };
            const result = await servicesCollection.deleteOne(query);
            console.log('deleting service with id ', result);
            res.json(result);
        })


        //use post to load the data of ordered product in a item
        app.post('/service/byId', async (req, res) => {
            console.log('the keys of product : ', req.body);
            const serviceIds = req.body;
            const filter = { id: { $in: serviceIds } };
            const cursor = servicesCollection.find(filter);
            const services = await cursor.toArray();
            //console.log('hitt ', services);
            res.json(services);
        })

        //get api for all services/car
        app.get('/services/car', async (req, res) => {
            console.log('get request for services/car : ');
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //get api for all reviews
        app.get('/reviews', async (req, res) => {
            console.log('get request for review : ');
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //post api to submit review
        app.post('/submitReview', async (req, res) => {
            console.log('review body : ', req.body);
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log('Successfully inserted');
            res.json(result);
        })

        //get api for all orders
        app.get('/orders', verifyToken, async (req, res) => {
            const requester = req.decodedEmail;
            console.log('requester', requester);
            if (requester) {
                const cursor = ordersCollection.find({});
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).json({ message: 'You do not have access to all orders.' });
            }
        });

        //post api to place a order
        app.post('/placeOrder', async (req, res) => {
            console.log('order : ', req.body);
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log('Successfully ordered');
            res.json(result);
        })

        //get api to show my order (with token verification)
        app.get('/myOrder', verifyToken, async (req, res) => {
            //http://localhost:5000/myOrder?email=shihab@gmail.com
            const email = req.query.email
            const requester = req.decodedEmail;
            console.log('requester', requester);
            if (requester) {
                const filter = { email };
                const cursor = ordersCollection.find(filter);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).json({ message: 'You do not have access to orders.' });
            }
        })

        // delete  api to delete an order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            console.log(' delete/id ', id);
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting order with id ', result);
            res.json(result);
        })

        // update  api to change status of a order
        app.put('/updateOrder/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            //console.log(data);
            console.log('data', data);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    status: data.status
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // post api to add an user
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('post /users ', user)
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // put api to add an user
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put /users ', user)
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        });

        //get api to know user's role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //put api to make a user admin (with token verification )
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            console.log('user to make admin ', user);
            //console.log('requester ', requester);
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                //console.log('requesterAccount ', requesterAccount);
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email.trim().toLowerCase() };
                    const updateDoc = { $set: { role: 'admin' } };
                    //console.log('filter ', filter);

                    const result = await usersCollection.updateOne(filter, updateDoc);
                    //console.log('result ', result);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }
        })




    } finally {
        // the next line is commented, because connection is closing before trigger post
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
