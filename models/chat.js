let mongoose = require(`mongoose`);

let VChatSchema = new mongoose.Schema({
    cid: { type: String },
    rid: { type: String },
    type: { type: String },
    date: { type: String },
    startTime: { type: String },
    endTime: { type: String }
});

module.exports = mongoose.model('VChatSchema', VChatSchema, 'vchats');