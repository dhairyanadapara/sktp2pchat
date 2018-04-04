let mongoose = require(`mongoose`);

let VChatSchema = new mongoose.Schema({
    cid: { type: String, require: true },
    cname: { type: String, required: true },
    rid: { type: String, require: true },
    rname: { type: String, required: true },
    type: { type: String },
    date: { type: String },
    startTime: { type: String },
    endTime: { type: String }
});

module.exports = mongoose.model('VChatSchema', VChatSchema, 'vchats');