const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545");
const signer = provider.getSigner(0);

const contractAddress = "0x87e915B7E9eD3B79815cef2844B59608e231C7db"; 
const contractABI = require('./abi'); 
const contract = new ethers.Contract(contractAddress, contractABI, signer);

app.post('/submit-score', async (req, res) => {
    const { username, score } = req.body;

    if (typeof username !== 'string' || username.length > 16 || typeof score !== 'number' || score > 999999) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const tx = await contract.submitScore(username, score);
        await tx.wait();
        res.status(200).json({ message: 'Score submitted to blockchain' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Blockchain write failed' });
    }
});

app.listen(3000, () => {
    console.log('✅ Backend listening on http://localhost:3000');
});
