const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const isLoggedIn = require("../middleware/isLoggedIn")
const isCouncilMember = require("../middleware/isCouncilMember")
const { sendMessageToChannel } = require("../services/DiscordService")

const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
            cb(new Error("Please upload a JPG or PNG image"))
        }

        cb(undefined,true)
    }
})

router.post("/", async (req, res) => {
    const user = new User(req.body)
    let token
    try {
        await user.save()
        token = await user.generateAuthToken()
    } catch (error) {
        if (error.code === 11000) {
            let dupeValue
            Object.keys(error.keyValue).forEach((key) => {
                dupeValue = error.keyValue[key]
            })
            return res.status(400).json({error:`${dupeValue} is already in use.`})
        } else {
            return res.status(500).json({error:"Internal Server Error"})
        }
    }

    if (process.env.NODE_ENV === "production") {
        await sendMessageToChannel(
            "applications", 
            `New user account created.\nUsername: ${user.username}\nDiscord Username: ${user.discordUsername}`
        )
    }
    
    res.status(201).json({user, token})
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).json({user, token})
    } catch (error) {
        console.error(error)
        res.status(400).send()
    }
})

router.post("/logout", isLoggedIn, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send()
    }
})

router.post("/logoutAll", isLoggedIn, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send()
    }
})

router.get("/all", async (req, res) => {
    let users
    try {
        users = await User.find()
    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"Internal Server Error"})
    }
    const payloadUsers = users.map((user) => ({
        username: user.username,
        guildMemberLevel: user.guildMemberLevel,
        className: user.className,
        race: user.race,
        specialization: user.specialization,
        avatar: user.avatar,
        id: user._id,
        applicationID: user.applicationID,
    }))
    res.status(200).json({users: payloadUsers})
})

router.get("/me", isLoggedIn, async (req, res) => {
    res.status(200).json({user: req.user})
})

router.post("/me/avatar", isLoggedIn, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
    .resize({width: 250,height: 250})
    .png()
    .toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.status(200).json({imageData: buffer.toString("base64")})
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

router.patch("/me", isLoggedIn, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["discordUsername", "username", "password", "className", "race", "specialization"]
    const valid = updates.every((update) => allowedUpdates.includes(update))

    if (!valid) return res.status(400).json({error: "Invalid Updates"})

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(202).send()
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }
})

router.post("/:id/rank", isLoggedIn, isCouncilMember, async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({error:"User Not Found"})

    if (req.body.action === "Promote") {
        if (user.guildMemberLevel > 2) return res.status(400).json({error:"User already max rank."})
        user.guildMemberLevel += 1
    }

    if (req.body.action === "Demote") {
        if (user.guildMemberLevel < 0) return res.status(400).json({error:"User already lowest rank."})
        user.guildMemberLevel -= 1
    }
    
    try {
        await user.save()
        res.status(200).send({message:"Success"})
    } catch (error) {
        console.error(error)
        res.status(500).send()
    }
})

router.delete("/:id", isLoggedIn, isCouncilMember, async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({error:"User Not Found"})
    try {
        await user.remove()
        res.status(200).send({message:"Success"})
    } catch (error) {
        console.error(error)
        res.status(500).send()
    }
})

router.delete("/me", isLoggedIn, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

router.delete("/me/avatar", isLoggedIn, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.delete("/:id/avatar", isLoggedIn, isCouncilMember, async (req, res) => {
    let user
    try {
        user = await User.findById(req.params.id)
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: "Internal Server Error"})
    }

    if (!user) {
        res.status(404).json({error: "User not found"})
    }

    user.avatar = null
    await user.save()
    res.status(200).json({message: "Success"})
})

router.get("/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()

        res.set("Content-Type","image/png")
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router
