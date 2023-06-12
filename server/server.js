const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const uploadDirectory = 'uploads';

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}


// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route for handling the login form submission
app.post('/login', (req, res) => {
    const { username, password, role, company } = req.body;
    // Perform your login logic here
    // For demonstration purposes, let's assume the username is "admin" and password is "password"
    console.log(username, password, role, company);

    if (role === 'Company' && company === 'Company 2' &&
        username === 'admin' && password === 'password') {
        // TODO: check the info 

        res.json({ success: true, message: 'org2createuser.html' });
    }
    if (role === 'Company' && company === 'Company 1' &&
        username === 'admin' && password === 'password') {
        // TODO: check the wallet 

        res.json({ success: true, message: 'org1createuser.html' });
    }
    if (role === 'Employer' && company === 'Company 1') {
        console.log("Employer of company 1");
        // TODO: check the wallet 

        res.json({ success: true, message: 'upload.html' });
    }
    if (role === 'Employer' && company === 'Company 2') {
        console.log("Employer of company 2");
        // TODO: check the wallet 

        res.json({ success: true, message: 'upload.html' });
    }
    else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));

// POST route for file upload
app.post('/upload', upload.single('pdf'), (req, res) => {
    // File upload successful
    console.log('File uploaded:', req.file);
    // Send a JSON response to the client

      // Hash the file using SHA256
    const filePath = uploadDirectory + '/' + req.file.filename;
    const fileData = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    console.log('File hash:', hash);

    // check the blockchain 

    const result = true;
    res.json({ success: result, message: 'valid.html' });
});

app.post('/registerUser', (req, res) => {
    // TODO: call the blockchain to register then send back the info 
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});