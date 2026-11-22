
function parseBankSMS(sms) {
    if (!sms || typeof sms !== "string") {
        throw new Error("Invalid SMS content");
    }

    const text = sms.toLowerCase();

    const debitKeywords = [
        "debited",
        "withdrawn",
        "spent",
        "sent"
    ];
    const creditKeywords = ["credited", "deposited", "received"];

    const isDebit = debitKeywords.some(keyword => text.includes(keyword));
    const isCredit = creditKeywords.some(keyword => text.includes(keyword));

    if (isDebit === isCredit) {
        throw new Error("Unable to identify transaction type");
    }

    // Extract transaction amount
    const amountMatch = sms.match(
        /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i
    );

    if (!amountMatch) {
        throw new Error("Unable to extract transaction amount");
    }

    const amount = Math.round(
        Number(amountMatch[1].replace(/,/g, "")) * 100
    );

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error("Invalid transaction amount");
    }

    return {
        type: isDebit ? "DEBIT" : "CREDIT",
        amount
    };
}

module.exports = { parseBankSMS };
