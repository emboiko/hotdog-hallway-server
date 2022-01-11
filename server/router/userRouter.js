const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const auth = require("../middleware/auth")
// const {welcomeEmail, cancelEmail} = require("../emails/account") // not implemented 

const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
            cb(new Error("Please upload an image"))
        }

        cb(undefined,true)
    }
})

router.post("/", async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        // welcomeEmail(user.email, user.username)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (err) {
        res.status(400).send()
    }
})

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

router.post("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

router.get("/me", auth, async (req, res) => {
    res.send(req.user)
})

router.post("/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
    .resize({width: 250,height: 250})
    .png()
    .toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

router.patch("/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["username", "email", "password"]
    const valid = updates.every((update) => allowedUpdates.includes(update))

    if (!valid) return res.status(400).send({error: "Invalid Updates"})

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(202).send(req.user)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete("/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        // cancelEmail(req.user.email, req.user.username)
        res.send(req.user)
    } catch (err) {
        res.status(500).send()
    }
})

router.delete("/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get("/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()

        res.set("Content-Type","image/png")
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send()
    }
})

module.exports = router