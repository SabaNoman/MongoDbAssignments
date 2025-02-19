import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import { config } from 'dotenv';
const app = express();
const port = 3000;

// app.use(express.urlencoded());
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
console.log(__dirname)

app.use('/static', express.static(path.join(__dirname, 'public')))

const uri = "mongodb+srv://sabanoman5:n0NpNfgYRPFyNccX@cluster0.f7eta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client) {
    //put var or const if you are using import
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


app.get('/', async (req, res) => {   
    res.render('form')
    // try {
    //     await client.connect();
    //     const usersCollection = client.db('codegirls').collection('users');
    //     let finddata = await usersCollection.findOne({"firstname": "Saba"})
    //     console.log(finddata)
    //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //     res.send(finddata)
    // } finally {
    //     // res.send('ok')
    //     // Ensures that the client will close when you finish/error
    //     await client.close();
    // }
});

app.get('/users', async (req, res) => {   
    
    try {
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        let userData = await usersCollection.find().toArray()
        console.log(userData)
        res.render('./index.ejs', {userData});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

app.post('/addUser', async (req, res) => {
    try {        
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        let newUser = req.body;
        let result = await usersCollection.insertOne(newUser);
        res.send({ message: "User added successfully", userId: result.insertedId });
        console.log("user added successfully!")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/updateUser', async (req, res) => {
    try {        
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        let newUser = req.body;
        let result = await usersCollection.updateOne(newUser);
        res.send({ message: "User added successfully", userId: result.insertedId });
        console.log("user added successfully!")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/edit', async (req, res) => {
    try {
        console.log('Inside update:', req.body);

        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        // Update user document
        const result = await usersCollection.updateOne(
            { _id: ObjectId.createFromHexString(req.body._id) },
            //$set updates the fields
            { $set: { firstname: req.body.firstname, lastname: req.body.lastname} }
        );

        if (result.modifiedCount > 0) {
            console.log(`${result.modifiedCount} document updated successfully!`);
        } else {
            console.log('No document was updated (perhaps it did not exist).');
        }
        res.redirect('/');
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        console.log("Deleting user with ID:", req.params.id);
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        // Convert id to ObjectId safely
        const userId = new ObjectId(req.params.id);

        // Delete the document
        const result = await usersCollection.deleteOne({ _id: userId });

        // Check if a document was deleted
        if (result.deletedCount > 0) {
            res.json({ success: true, message: "User deleted successfully!" });
        } else {
            res.status(404).json({ success: false, message: "User not found." });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


app.listen(port)

// main().catch(console.error);