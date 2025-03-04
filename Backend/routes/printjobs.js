const express = require('express');
const router = express.Router();
const Shop = require('../models/shop');
const PrintJob = require('../models/printjob');

// Fetch shop details by ID (this should probably be in shop.js, not here)
router.get('/:shopId', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.shopId).select('name bw_cost_per_page color_cost_per_page');
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shop details' });
    }
});

// Fetch print jobs by shop ID
router.get('/prints/:shopId', async (req, res) => {
    try {
        const printJobs = await PrintJob.find({ shop_id: req.params.shopId });
        console.log("Fetched print jobs:", printJobs);
        res.status(200).json(printJobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch print jobs' });
    }
});

// Update print job status
router.put('/:jobId', async (req, res) => { // Changed from '/printjobs/:jobId' to avoid nesting
    try {
        const { status } = req.body;
        const printJob = await PrintJob.findByIdAndUpdate(req.params.jobId, { status }, { new: true });
        if (!printJob) {
            return res.status(404).json({ error: 'Print job not found' });
        }
        res.status(200).json(printJob);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update print job status' });
    }
});

module.exports = router;