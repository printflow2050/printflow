const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema({
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    token_number: { type: String, required: true },
    file_path: { type: String, required: true },
    print_type: { type: String, enum: ['bw', 'color'], required: true },
    print_side: { type: String, enum: ['single', 'double'], required: true },
    copies: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
    uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrintJob', printJobSchema);