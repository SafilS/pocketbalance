
const express = require("express");
const router = express.Router();

const {
    processTransaction
} = require("../services/transactionService");

router.post("/", (req, res) => {
    try {
        const sms = req.body?.sms || req.body?.SMS;

        if (!sms) {
            return res.status(400).json({
                success: false,
                message: "SMS content is missing"
            });
        }

        const result = processTransaction(sms);
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
