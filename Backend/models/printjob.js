const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema({
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    print_type: { type: String, required: true, enum: ['color', 'black and white'] },
    cost: { type: Number, required: true },
    printed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrintJob', printJobSchema);