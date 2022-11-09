const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const userName = process.env.MONGODB_USER_NAME;
const userPassword = process.env.MONGODB_PASSWORD;

const uri = `mongodb+srv://${userName}:${userPassword}@cluster0.cjfgfqu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {

        const serviceCollection = client.db('lawMan').collection('services');
        const reviewsCollection = client.db('lawMan').collection('reviews');

        // get all service and limit , sorting
        app.get('/services', async (req, res) => {
            const limitServices = parseInt(req.query.limit);
            const cursor = serviceCollection.find();
            const result = await cursor.sort({ _id: -1 }).limit(limitServices).toArray();
            res.send(result);
        });

        //get single service 
        app.get('/services/:serviceID', async (req, res) => {
            const serviceID = req.params.serviceID;
            const query = { _id: ObjectId(serviceID) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });

        // insert services
        app.post('/my-services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            if (result?.acknowledged === true) {
                res.send({ status: 'good', message: 'Service Added Successfully.' });
            } else {
                res.send({ status: 'bad', message: 'Service Could Not Be Added.' });
            }
        });

        // get services by user id

        app.get('/my-services/:userID', async (req, res) => {
            const userID = req.params.userID;
            const query = { authorID: userID };
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // delete service 
        app.delete('/my-services/:serviceID', async (req, res) => {
            const serviceID = req.params.serviceID;
            const query = { _id: ObjectId(serviceID) };
            const result = await serviceCollection.deleteOne(query);
            if (result?.acknowledged === true) {
                res.send({ status: 'good', message: 'Service Deleted Successfully.' });
            } else {
                res.send({ status: 'bad', message: 'Service Could Not Be Deleted.' });
            }
        });

        // get users reviews 
        app.get('/my-reviews/:userID', async (req, res) => {
            const userID = req.params.userID;
            const query = { authorID: userID };
            const cursor = reviewsCollection.find(query);
            const result = await cursor.sort({ _id: -1 }).toArray();
            res.send(result);
        });

        // insert reviews
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            if (result?.acknowledged === true) {
                res.send({ status: 'good', message: 'Review Added Successfully.' });
            } else {
                res.send({ status: 'bad', message: 'Review Could Not Be Added.' });
            }
        });

        // review edit by user
        app.patch('/my-reviews/edit/:reviewID', async (req, res) => {
            const reviewID = req.params.reviewID;
            const reqData = req.body;
            const updatedData = { $set: reqData }
            const query = { _id: ObjectId(reviewID) };
            const result = await reviewsCollection.updateOne(query, updatedData);
            if (result?.acknowledged === true) {
                res.send({ status: 'good', message: 'Review Updated Successfully.' });
            } else {
                res.send({ status: 'bad', message: 'Review Could Not Be Updated.' });
            }

        });

        //get reviews by single service
        app.get('/reviews/:serviceID', async (req, res) => {
            const serviceID = req.params.serviceID;
            const query = { serviceID: serviceID };
            const cursor = reviewsCollection.find(query);
            const result = await cursor.sort({ _id: -1 }).toArray();
            res.send(result);
        });

        // delete reviews 
        app.delete('/reviews/:reviewID', async (req, res) => {
            const reviewID = req.params.reviewID;
            const query = { _id: ObjectId(reviewID) };
            const result = await reviewsCollection.deleteOne(query);
            if (result?.acknowledged === true) {
                res.send({ status: 'good', message: 'Review Deleted Successfully.' });
            } else {
                res.send({ status: 'bad', message: 'Review Could Not Be Deleted.' });
            }
        });

    } finally {

    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Law-man server is running');
});

app.get('*', (req, res) => {
    res.send('Law-man server is running');
});


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});