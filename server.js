const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yeed0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("RKbicyle");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };

      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    // Delete order from user
    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log("delete", id);
      const result = await ordersCollection.deleteOne(query);

      res.json(result);
    });

    // add Service by admin
    app.post("/addServices", async (req, res) => {
      console.log(req.body);
      const result = await servicesCollection.insertOne(req.body);
      res.json(result);
    });
    // get services from UI
    app.get("/allServices", async (req, res) => {
      const result = await servicesCollection.find({}).toArray();
      res.json(result);
    });

    // add review by client
    app.post("/addReview", async (req, res) => {
      console.log(req.body);
      const result = await reviewsCollection.insertOne(req.body);
      res.json(result);
    });
    // get review by client
    app.get("/addReview", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.json(result);
    });

    // get single service by ID
    app.get("/singleService/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await servicesCollection
        .find({ _id: ObjectId(req.params.id) })
        .toArray();
      res.send(result[0]);
      console.log(result);
    });
    // Insert order from user
    app.post("/addOrders", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.json(result);
    });

    // for admin or special user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/addReview", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await reviewsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello RIDERIOT!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
