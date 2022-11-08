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