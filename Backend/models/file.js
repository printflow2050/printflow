const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    file_name: { type: String, required: true },
    file_size: { type: Number, required: true },
    file_type: { type: String, required: true },
    status: { type: String, required: true, enum: ['uploaded', 'printed'] }
});

module.exports = mongoose.model('File', fileSchema);