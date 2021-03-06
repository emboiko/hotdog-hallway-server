const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    discordUsername: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 7, 
        maxLength: 37,
        validate(nameString) {
            if (!/^.*#\d{4}$/.test(nameString)) throw new Error("Invalid Discord Username")
        }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 12,
        validate(nameString) {
            if (!/^.{2,12}$/.test(nameString.toLowerCase())) throw new Error("Invalid Character Name")
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    avatar: {
        type: Buffer
    },
    /*
        0: Non-Member/Applicant
        1: Member/Non-Raider
        2: Raider/Core Raider
        3: Council/Guild Management/Guild Master
     */
    guildMemberLevel: {
        type: Number,
        required: true,
        default: 0,
    },
    applicationID: {
        type: String,
    },
    className: {
        type: String,
        trim: true,
    },
    race: {
        type: String,
        trim: true,
    },
    specialization: {
        type: String,
        trim: true,
    },
    previousUsernames: [{
        username: {
            type: String,
            required: true
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
},{
    timestamps: true
})

// User Instance
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// User Model
userSchema.statics.findByCredentials = async (username, pw) => {
    const user = await User.findOne({ username })
    if (!user) throw new Error("Unable to login.")

    const isMatch = await bcrypt.compare(pw, user.password)
    if (!isMatch) throw new Error("Unable to login.")

    return user
}

// Hooks
userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    if (user.isModified("username")) {
        user.username = user.username[0].toUpperCase() + user.username.slice(1).toLowerCase()
    }
    next()
})

const User = mongoose.model("user", userSchema)
module.exports = User
