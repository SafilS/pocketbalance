
const fs = require("fs");
const path = require("path");

const BALANCE_FILE = path.join(
    __dirname,
    "../../data/balance.json"
);

const { parseBankSMS } = require("../utils/smsParser");

function processTransaction(sms) {
    const transaction = parseBankSMS(sms);

    const data = JSON.parse(
        fs.readFileSync(BALANCE_FILE, "utf8")
    );

    if (transaction.type === "DEBIT") {
        if (data.balance < transaction.amount) {
            throw new Error("Insufficient balance");
        }

        data.balance -= transaction.amount;
    } else {
        data.balance += transaction.amount;
    }

    const transactionRecord = {
        id: Date.now().toString(),
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: data.balance,
        sms,
        createdAt: new Date().toISOString()
    };

    data.transactions.unshift(transactionRecord);

    fs.writeFileSync(
        BALANCE_FILE,
        JSON.stringify(data, null, 2)
    );

    return {
        success: true,
        transactionType: transaction.type,
        amount: transaction.amount,
        balance: data.balance,
        formattedBalance: formatCurrency(data.balance)
    };
}

function formatCurrency(paise) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(paise / 100);
}

module.exports = { processTransaction };
