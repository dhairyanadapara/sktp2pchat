let mongoose = require(`mongoose`);

let VChatSchema = new mongoose.Schema({
    cid: {type: String},
    rid: {type: String},
    type: {type: String},
    date: {type: Date},
    startTime:{type:Date},
    endTime:{type:Date}
});

module.exports = mongoose.model('VChatSchema', VChatSchema);