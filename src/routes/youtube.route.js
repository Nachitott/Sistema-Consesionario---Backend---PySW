const express = require("express");
const router = express.Router();

const {
    buscarVideo
} = require("../controllers/youtube.controller");


router.get("/", buscarVideo);


module.exports = router;