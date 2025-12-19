const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/process", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: { status: 400, detail: "query is required" } });
    }

    const { data } = await axios.get("https://api.chucknorris.io/jokes/random", { timeout: 10000 });

    res.json({
      result: `Query '${query}' processed successfully. Joke: ${data.value}`,
      source: "chucknorris.io"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
