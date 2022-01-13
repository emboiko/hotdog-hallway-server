const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    characterName: {
        type: String,
        required: true,
        trim: true,
    },
    testBody: {
        type: String,
        required: true
    },
    testTitleField: {
        type: String
    },
    // todo: isDeclined
},{
    timestamps: true
})

const Application = mongoose.model("application", applicationSchema)
module.exports = Application
