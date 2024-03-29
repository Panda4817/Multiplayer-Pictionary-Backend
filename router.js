import { Router } from "express";
import { readFileSync } from "fs";
import cors from "cors";
import { corsOptions } from "./cors.js";

export const router = Router();

// back end index page
router.get("/", cors(corsOptions), (req, res) => {
	res.send("Server is up and running");
});

// Random room name generated from a list of words
router.get("/room", cors(corsOptions), (req, res) => {
	const text = readFileSync("./roomWords.txt", "utf-8").split("\n");
	const words = [];
	for (let i = 0; i < 3; i++) {
		words.push(text[Math.floor(Math.random() * text.length)]);
	}
	res.json({ room: words.join("-") });
});
