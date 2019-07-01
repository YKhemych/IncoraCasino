const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameMachineSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    casino: {
        ref: 'casinos',
        type: Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('gameMachines', gameMachineSchema);