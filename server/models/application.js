const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    username: {
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
    status: { // [pending, isDeclined, isAccepted]
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Application = mongoose.model("application", applicationSchema)
module.exports = Application
