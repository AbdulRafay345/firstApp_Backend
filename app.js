const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs")
const mongoUrl = "mongodb+srv://Abdul:rafay@cluster0.x55rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const jwt = require("jsonwebtoken");
const cors = require('cors');
app.use(cors());

const JWT_SECRET =  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";
mongoose.connect(mongoUrl).then(() => {
    console.log("database connected ")
}).catch((e) => {
    console.log(e);

});

require('./AuthModel');
require('./ItemModel');
const User = mongoose.model('UserInfo')
const Item = mongoose.model('Item')

app.get("/", (req, res) => {
    res.send({ status: "started" })
})

app.post('/register', async (req, res) => {
    console.log("Register Route Hit");
    const { name, email, number, password } = req.body;

    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
        console.log("User already exists");
        return res.send({ data: 'User already exists' });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        await User.create({
            name: name,
            email: email,
            number,
            password: encryptedPassword
        });
        console.log("User created successfully");
        res.send({ status: 'ok', data: 'User created' });
    } catch (error) {
        console.error("Error creating user:", error);
        res.send({ status: 'error', data: error });
    }
});




app.post("/login", async (req, res) => {
    console.log('Login route hit');
    console.log('Request body:', req.body);  // Log the entire request body

    const { email, password } = req.body;

    // Log the email and password to check what the frontend is sending
    console.log('Received email:', email);
    console.log('Received password:', password);

    const oldUser = await User.findOne({ email });

    if (!oldUser) {
        console.log('User not found for email:', email);
        return res.send({ data: "User doesn't exist!!" });
    }

    // Log the retrieved user
    console.log('User found:', oldUser);

    const passwordMatch = await bcrypt.compare(password, oldUser.password);
    console.log('Password comparison result:', passwordMatch);

    if (passwordMatch) {
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
        console.log('Generated JWT token:', token);

        return res.send({
            status: "ok",
            data: token,
            userType: oldUser.userType,
        });
    } else {
        console.log('Incorrect password for user:', email);
        return res.send({ data: "Invalid credentials" });
    }
});





app.post("/userdata", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      const useremail = user.email;
  
      User.findOne({ email: useremail }).then((data) => {
        return res.send({ status: "Ok", data: data });
      });
    } catch (error) {
      return res.send({ error: error });
    }
  });



  app.post("/update-user", async (req, res) => {
    const { name, email, mobile, image, gender, profession } = req.body;
    console.log(req.body);
    try {
      await User.updateOne(
        { email: email },
        {
          $set: {
            name,
            mobile,
            image,
            gender,
            profession,
          },
        }
      );
      res.send({ status: "Ok", data: "Updated" });
    } catch (error) {
      return res.send({ error: error });
    }
  });


  app.post("/add-event", async (req, res) => {
    console.log("Add Event Route Hit");
    const { title, description, date, location, category } = req.body;

    if (!title || !description || !date || !location || !category) {
        return res.status(400).send({ status: "error", message: "All fields are required" });
    }

    try {
        const newEvent = new Item({
            title,
            description,
            date,
            location,
            category,
            createdDate: Date.now(),
        });
        await newEvent.save();
        console.log("Event added:", newEvent);
        res.send({ status: "ok", message: "Event added successfully", event: newEvent });
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send({ status: "error", message: "Failed to add event" });
    }
});

app.get('/get-items', async (req, res) => {
    try {
        // Fetch all items from the database using Mongoose's find method
        const items = await Item.find(); // Assuming Item is a valid model
        res.send({ status: 'ok', items }); // Return items in the response
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send({ status: 'error', message: 'Failed to fetch items' });
    }
});


  


app.listen(5002, () => {
    console.log("app is running")
})