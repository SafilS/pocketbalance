
const express = require("express");
const router = express.Router();

const {
    processTransaction
} = require("../services/transactionService");

router.post("/", (req, res) => {
    console.log("Transaction endpoint reached");
    console.log("Request body:", req.body);

    try {
        const sms = req.body.sms || req.body.SMS;
        const result = processTransaction(sms);

        console.log("Transaction processed:", result);

        res.json(result);

    } catch (error) {
        console.error("Transaction failed:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
