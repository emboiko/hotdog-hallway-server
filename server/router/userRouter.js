const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const isLoggedIn = require("../middleware/isLoggedIn")

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
    req.body.isCouncilMember = false
    req.body.isGuildMember = false
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).json({user, token})
    } catch (error) {
        if (error.code === 11000) {
            let dupeValue
            Object.keys(error.keyValue).forEach((key) => {
                dupeValue = error.keyValue[key]
            })
            res.status(400).json({error:`${dupeValue} is already in use.`})
        } else {
            res.status(500).json({error:"Internal Server Error"})
        }
    }
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
    res.status(200).send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

router.patch("/me", isLoggedIn, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["discordUsername", "username", "password"]
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
