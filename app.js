import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import { config } from 'dotenv';
const app = express();
const port = 3000;

app.use(express.urlencoded());
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
console.log(__dirname)

app.use('/static', express.static(path.join(__dirname, 'public')))
//Database name: codegirls, Collection name: users 
const uri = "mongodb+srv://sabanoman5:n0NpNfgYRPFyNccX@cluster0.f7eta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function main() {    
    try {
        // Connect to the MongoDB cluster
        await client.connect();
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
    res.render('index')
});

app.get('/viewUsers', async (req, res) => {       
    try {
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');
        let userData = await usersCollection.find().toArray()
        console.log(userData)
        res.render('view', {userData});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } 
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
    finally {        
        // Ensures that the client will close when you finish
        await client.close();
    }
});

app.get('/addUser', async (req, res) => {
    try {      
        res.render('add');   
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/addUser', async (req, res) => {
    try {           
        let newUser = req.body; 
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');        
        await usersCollection.insertOne(newUser);
        res.redirect('/addUser?success=true');
        console.log("User added successfully!")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// app.post('/updateUser', async (req, res) => {
//     try {        
//         await client.connect();
//         const usersCollection = client.db('codegirls').collection('users');

//         let newUser = req.body;
//         let result = await usersCollection.updateOne(newUser);
//         res.send({ message: "User added successfully", userId: result.insertedId });
//         console.log("user added successfully!")
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });


app.get('/editUser', async (req, res) => {
    try {   
        res.render('edit');    
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/editUser', async (req, res) => {
    try {
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users');

        const result = await usersCollection.updateOne({ email: req.body.email },
            { $set: { name: req.body.name, email: req.body.email} }
        );

        if (result.modifiedCount > 0) {
            res.redirect('/editUser?success=true');
            // console.log(`${result.modifiedCount} document updated successfully!`);
        } else {
            res.redirect('/editUser?failure=true');
            console.log('No document was updated (perhaps it did not exist).');
        }
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/deleteUser', async (req, res) => {
    try {   
        res.render('delete');    
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/deleteUser', async (req, res) => {
    try {           
        await client.connect();
        const usersCollection = client.db('codegirls').collection('users'); 
        console.log(req.body)
        const result = await usersCollection.deleteOne({ email:req.body.email });
        // Checking  if the document was deleted
        if (result.deletedCount > 0) {
            res.redirect('/deleteUser?success=true');
            // res.json({ success: true, message: "User deleted successfully!" });
        } else {
            res.redirect('/deleteUser?failure=true');
            // res.status(404).json({ success: false, message: "User not found." });
        }        
        console.log("User deleted successfully!")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//This was working but I manually added id using Thunderclient
// app.delete('/delete/:id', async (req, res) => {
//     try {
//         console.log("Deleting user with ID:", req.params.id);
//         await client.connect();
//         const usersCollection = client.db('codegirls').collection('users');
//         // Convert id to ObjectId safely
//         const userId = new ObjectId(req.params.id);

//         // Delete the document
//         const result = await usersCollection.deleteOne({ _id: userId });

//         // Check if a document was deleted
//         if (result.deletedCount > 0) {
//             res.json({ success: true, message: "User deleted successfully!" });
//         } else {
//             res.status(404).json({ success: false, message: "User not found." });
//         }
//     } catch (error) {
//         console.error("Error deleting user:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });

app.listen(port)
// main().catch(console.error);