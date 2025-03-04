const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Shop = require('../models/shop');
const QRCode = require('qrcode');

// global variables
const { JWT_SECRET } = require("../config");

// Register shop route
router.post('/register', async (req, res) => {
    const { name, ownerName, email, address, phone, password, bw_cost_per_page, color_cost_per_page } = req.body;
    
    console.log(req.body);

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("in the try block");

        const newShop = new Shop({
            name,
            ownerName,
            email,
            address,
            phone,
            password: hashedPassword,
            qr_code: null,
            bw_cost_per_page,
            color_cost_per_page,
        });
        await newShop.save();

        // Generate the QR code URL using the shop's ID
        const qrData = `http://localhost:5173/upload?shop_id=${newShop._id}`;
        const qrCodeURL = await QRCode.toDataURL(qrData);

        console.log();

        // Update the shop with the generated QR code URL
        newShop.qr_code = qrCodeURL;
        await newShop.save();

        res.status(201).json(newShop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to register shop' });
    }
});

// Login shop route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const shop = await Shop.findOne({ email }).select('+password');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        const isMatch = await bcrypt.compare(password, shop.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ shopId: shop._id }, JWT_SECRET, { expiresIn: '1h' });

        // Exclude the password field from the response
        const { password: _, ...shopWithoutPassword } = shop.toObject();

        res.status(200).json({ message: 'Login successful', shop: shopWithoutPassword, token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to authenticate token' });
        }
        req.shopId = decoded.shopId;
        next();
    });
};

// Fetch shop details by ID route
router.get('/:shopId', verifyToken, async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.shopId);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shop details' });
    }
});

module.exports = router;