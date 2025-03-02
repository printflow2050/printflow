const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qr_code: { type: String, required: true },
    bw_cost_per_page: { type: Number, required: true },
    color_cost_per_page: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);