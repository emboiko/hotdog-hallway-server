const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        default: "Anonymous",
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email)) throw new Error("Invalid Email.")
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(password) {
            if (password.toLowerCase().includes("password")) throw new Error("Invalid Password")
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
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
    delete userObject.avatar

    return userObject
}

// User Model
userSchema.statics.findByCredentials = async (email, pw) => {
    const user = await User.findOne({ email })
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
    next()
})

const User = mongoose.model("user", userSchema)
module.exports = User
