const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const casinoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        ref: 'users',
        type: Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('casinos', casinoSchema);