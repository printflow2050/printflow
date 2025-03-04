const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Customer = require('../models/customer');
const File = require('../models/file');
const PrintJob = require('../models/printjob');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Handle file upload and create print job
router.post('/:shopId', upload.single('file'), async (req, res) => {
    const { shopId } = req.params;
    const { print_type, print_side, copies } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const token_number = Math.floor(10000 + Math.random() * 90000).toString();
        const file_path = req.file.path;

        // Create a new file entry
        const newFile = new File({
            shop_id: shopId,
            token_number,
            file_path
        });
        await newFile.save();

        // Create a new print job entry
        const newPrintJob = new PrintJob({
            shop_id: shopId,
            token_number,
            file_path,
            print_type,
            print_side,
            copies
        });
        await newPrintJob.save();

        res.status(201).json({ message: 'File uploaded and print job created', token_number });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create print job' });
    }
});

module.exports = router;