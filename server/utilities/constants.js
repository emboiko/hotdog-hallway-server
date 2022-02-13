const DISCORD_CHANNELS = {
  "applications": "930999617204662282",
  "general-chat": "304008740271816704"
}

const APPLICATION_STATUSES = {
  pending: "pending",
  declined: "declined",
  accepted: "accepted",
}

const APPLICATION_RESPONSES = {
  declined: "Thanks for applying to <Hotdog Hallway>, unfortunately at this time we have chosen to move forward with another applicant. You are always welcome to reapply as you see openings on the site!",
  accepted: "Thanks for applying to <Hotdog Hallway>! 🌭 The guild council has reviewed your application, and we think you might be a great fit! We'll reach out to you within 24 hours, but feel free to contact a council member in the meantime."
}

module.exports = {
  DISCORD_CHANNELS,
  APPLICATION_STATUSES,
  APPLICATION_RESPONSES,
}