
const express = require("express");
const router = express.Router();

const {
    processTransaction
} = require("../services/transactionService");

router.post("/", (req, res) => {
    try {
        const { sms } = req.body;

        const result = processTransaction(sms);

        res.json(result);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
