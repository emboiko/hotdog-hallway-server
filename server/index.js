const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`Express server listening on port ${PORT}`));
