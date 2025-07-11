const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const http = require('http');
const mongoose = require("mongoose");
const  {Server} = require("socket.io");
const { ObjectId } = require("mongoose").Types;

const app = express();
const port = 4000;

  const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors:{
    origin: '*'
  }
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect("mongodb+srv://aganaysambyal:123@cluster1.itbg0z4.mongodb.net/", {
  useNewUrlParser: true,//ensures the connection string is passed successfully
  useUnifiedTopology: true,//Uses the new Server Discovery and Monitoring engine for better connection handling
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Models
const Users = mongoose.model("Users", {
  username: String,
  email: String,
  password: String,
  contactNumber: String,
  likeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }]
});

const Products = mongoose.model("Products", {
  pname: String,
  pdesc: String,
  price: String,
  category: String,
  pimage: String,
  pimage2: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
});

const Message = mongoose.model("Message", {
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
  username: String,
  msg: String,
  timestamp: { type: Date, default: Date.now },
});



// Home Route
app.get("/", (req, res) => res.send("Hello, World!"));


app.get("/get-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Populate 'addedBy' field to get the contact number
    let product = await Products.findById(productId).populate("addedBy", "contactNumber");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Convert Mongoose document to a plain object
    product = product.toObject();

    // Ensure contact details are always included
    product.contactDetails = product.addedBy?.contactNumber || "No contact details available";

    // Remove price only for Lost & Found category
    if (product.category === "Lost & Found") {
      delete product.price;
    }

    res.status(200).json({ message: "Success", product });
  } catch (error) {
    console.error("Error in /get-product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




//Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, contactNumber } = req.body;

    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const user = new Users({ username, email, password, contactNumber });
    await user.save();
    res.status(201).json({ message: "User signed up successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error signing up user" });
  }
});

//Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ $or: [{ username }, { email: username }] });

    if (!user) {
      return res.status(404).json({ message: "No User Found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", { expiresIn: "1h" });

    res.json({ message: "Login successful!", token, userId: user._id, username: user.username, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Add Product Route
app.post("/add-product", upload.fields([{ name: 'pimage' }, { name: 'pimage2' }]), async (req, res) => {
  try {
    const { pname, pdesc, price, category, userId } = req.body;

    // Check if the primary image exists
    if (!req.files.pimage) {
      return res.status(400).json({ message: "Primary image is required" });
    }

    // Handle Lost & Found category (No price required)
    const finalPrice = category === "Lost & Found" ? null : price;

    const pimage = req.files.pimage[0].filename;
    const pimage2 = req.files.pimage2 ? req.files.pimage2[0].filename : "";

    const product = new Products({
      pname,
      pdesc,
      price: finalPrice,  
      category,
      pimage,
      pimage2,
      addedBy: userId,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully!" });

  } catch (error) {
    console.error("Error in /add-product:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post('/my-products', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Populate 'addedBy' to get user details (contact number)
    const products = await Products.find({ addedBy: userId })
      .populate("addedBy", "contactNumber");

    res.status(200).json({ message: "Success", products });

  } catch (error) {
    console.error("Error in /my-products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


//Get All Products
app.get('/get-products', async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    
    if (category) {
      query.category = category; //Show only selected category
    }

    const products = await Products.find(query);
    res.status(200).json({ message: 'Success', products });

  } catch (error) {
    console.error("Error in /get-products:", error);
    res.status(500).json({ message: 'Server error' });
  }
});




//Search Products by Name
app.get("/search-products", async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the frontend
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    
    const products = await Products.find({
      pname: { $regex: query, $options: "i" }, // Search by product name only
    });

    res.status(200).json({ message: "Success", products });
  } catch (error) {
    console.error("Error in /search-products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Like Product
app.post('/like-product', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.likeProducts.includes(productId)) {
      return res.status(400).json({ message: "Already liked this product" });
    }

    await Users.updateOne({ _id: userId }, { $addToSet: { likeProducts: productId } });

    res.status(200).json({ message: "Product liked successfully" });
  } catch (error) {
    console.error("❌ Error in /like-product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Get Liked Products
app.post('/liked-products', async (req, res) => {
  try {
    const user = await Users.findById(req.body.userId).populate({
      path: 'likeProducts',
      populate: { path: 'addedBy', select: 'contactNumber' } //Populate addedBy with contactNumber
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert likedProducts to an array with contact details
    const productsWithContact = user.likeProducts.map(product => ({
      ...product.toObject(),
      contactDetails: product.addedBy?.contactNumber || "Contact details unavailable"
    }));

    res.status(200).json({ message: "Success", products: productsWithContact });

  } catch (error) {
    console.error("Error in /liked-products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// Delete Product Route
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.body.userId; // Get userId from request body

    if (!ObjectId.isValid(productId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const product = await Products.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Authorization check
    if (product.addedBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Products.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unlike Product
app.post("/unlike-product", async (req, res) => {
  const { userId, productId } = req.body;

  if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove product from likeProducts array
    await Users.updateOne(
      { _id: userId },
      { $pull: { likeProducts: productId } }
    );

    res.json({ message: "Product unliked successfully!" });
  } catch (error) {
    console.error("Error in /unlike-product route:", error);
    res.status(500).json({ message: "Server error, try again later" });
  }
});

let messages = [];

io.on('connection', (socket) => {
  console.log('Socket Connected', socket.id);

  socket.on('joinProductRoom', async (productId) => {
    socket.join(productId);
    console.log(`User joined room: ${productId}`);

    // Fetch previous messages for this product from the database
    const productMessages = await Message.find({ productId }).sort({ timestamp: 1 });
    socket.emit('getMsg', productMessages); // Send previous messages to the user who joined
  });

  socket.on('sendMsg', async (data) => {
    const newMessage = new Message({
      productId: data.productId,
      username: data.username,
      msg: data.msg,
    });

    await newMessage.save(); // Save the message in the database

    // Emit the new message to all users in the product's room
    io.to(data.productId).emit('getMsg', await Message.find({ productId: data.productId }).sort({ timestamp: 1 }));
  });

  // Handle deleting a message
  socket.on('deleteMsg', async (data) => {
    await Message.deleteOne({ _id: data.msgId });

    // Emit the updated messages to all users in the product's room
    io.to(data.productId).emit('getMsg', await Message.find({ productId: data.productId }).sort({ timestamp: 1 }));
  });

  // Handle deleting all messages for a product
  socket.on('deleteAllMsgs', async (productId) => {
    await Message.deleteMany({ productId });

    // Emit an empty list of messages to all users in the product's room
    io.to(productId).emit('getMsg', []); // Send empty list to all users
  });

  socket.on('disconnect', () => {
    console.log('Socket Disconnected', socket.id);
  });
});






httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});