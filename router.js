const express = require("express");
const router = express.Router();
const fs = require("fs");

// back end index page
router.get("/", (req, res) => {
	res.header("Access-Control-Allow-Origin", process.env.CLIENT);
	res.send("Server is up and running");
});

// Random room name generated from a list of words
router.get("/room", (req, res) => {
	const text = fs.readFileSync("./roomWords.txt", "utf-8").split("\n");
	const words = [];
	for (let i = 0; i < 3; i++) {
		words.push(text[Math.floor(Math.random() * text.length)]);
	}
	res.header("Access-Control-Allow-Origin", process.env.CLIENT);
	res.json({ room: words.join("-") });
});

module.exports = router;
