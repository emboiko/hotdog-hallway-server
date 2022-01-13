const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    characterName: {
        type: String,
        required: true,
        trim: true,
    }
},{
    timestamps: true
})

const Application = mongoose.model("application", applicationSchema)
module.exports = Application
