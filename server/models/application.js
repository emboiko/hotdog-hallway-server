const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    playerCharacterName: {
        type: String,
        required: true,
    },
    playerClass: {
        type: String,
        required: true,
        trim: true,
    },
    playerRace: {
        type: String,
        required: true,
        trim: true,
    },
    playerInterestedInRaiding: {
        type: Boolean,
        required: true,
    },
    playerAgreedToRaidTimes: {
        type: Boolean,
        required: true,
    },
    playerAgreedToLootCouncil: {
        type: Boolean,
        required: true,
    },
    playerAgreedToAttendancePolicy: {
        type: Boolean,
        required: true,
    },
    playerAgreedToGemsAndEnchants: {
        type: Boolean,
        required: true,
    },
    playerAgreedToWorkingMicrophone: {
        type: Boolean,
        required: true,
    },
    playerInterestedInPvP: {
        type: Boolean,
        required: true,
    },
    playerRaidUtility: {
        type: String,
        trim: true
    },
    playerAdditionalInfo: {
        type: String,
        trim: true
    },
    status: { // [pending, declined, accepted]
        type: String,
        required: true,
        trim: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "User"
    }
},{
    timestamps: true
})

const Application = mongoose.model("application", applicationSchema)
module.exports = Application
