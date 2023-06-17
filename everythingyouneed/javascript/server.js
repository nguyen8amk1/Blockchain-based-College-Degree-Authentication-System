const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const uploadDirectory = 'uploads';
const credentials = [];

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}


// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

// Route for handling the login form submission
app.post('/login', (req, res) => {
    const { username, password, role, company } = req.body;
    // Perform your login logic here
    // For demonstration purposes, let's assume the username is "admin" and password is "password"
    console.log(username, password, role, company);

    if (role === 'Company' && company === 'Company 2' &&
        username === 'admin2' && password === 'password') {

        res.json({ success: true, message: 'org2CreateUser.html' });
    }
    if (role === 'Company' && company === 'Company 1' &&
        username === 'admin1' && password === 'password') {

        res.json({ success: true, message: 'org1CreateUser.html' });
    }
    if (role === 'Employer') {
        //console.log("Employer of company 1");

        credentials.forEach(element => {
            if(element.username === username && element.password == password) {
                res.json({ success: true, message: 'upload.html' });
                return;
            }
        });
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

app.post('/registerUser', async (req, res) => {
    // TODO: call the blockchain to register then send back the info 
    const { username, password, company } = req.body;
    let admin = undefined;
    if (company === 'Company 1') {
        admin = 'admin';
    }
    else if (company === 'Company 2') {
        admin = 'admin';
    }

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(username);
        if (userExists) {
            console.log('An identity for the user ${username} already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(admin);
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: admin, discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(username, userIdentity);

        credentials.push({username: username, password: password});

        res.json({ success: true, message: 'successfully registered user' });
        console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);

    } catch (error) {
        res.json({ success: false, message: 'Failed to register user' });
        console.error(`Failed to register user ${username}: ${error}`);
        process.exit(1);
    }
});

// POST route for file upload
app.post('/upload', upload.single('pdf'), async (req, res) => {
    // File upload successful
    console.log('File uploaded:', req.file);
    // Send a JSON response to the client

    // Hash the file using SHA256
    const filePath = uploadDirectory + '/' + req.file.filename;
    const fileData = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    console.log('File hash:', hash);

    // check the blockchain 
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        //const result = await contract.evaluateTransaction('queryAllStudents');
        //const result = await contract.evaluateTransaction('queryStudent', 'STUDENT0');

        const result = await contract.evaluateTransaction('checkIfStudentExists', hash);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        if (result.toString() === 'true') {
            res.json({ success: true, message: 'upload file success' });
        }
        else if (result.toString() === 'false') {
            res.json({ success: false, message: 'upload file failed' });
        }

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: error });
        process.exit(1);
    }

});



// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});