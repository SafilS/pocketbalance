
const express = require("express");
const fs = require("fs");
const path = require("path");

const transactionRoutes = require("./src/routes/transactionRoutes");

const app = express();
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Content-Type:", req.headers["content-type"]);
    next();
});
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const BALANCE_FILE = path.join(DATA_DIR, "balance.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/transactions", transactionRoutes);
app.use(express.urlencoded({ extended: true }));
// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read balance configuration
function getBalanceData() {
    if (!fs.existsSync(BALANCE_FILE)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(BALANCE_FILE, "utf8"));
}

// Save balance configuration
function saveBalanceData(data) {
    fs.writeFileSync(
        BALANCE_FILE,
        JSON.stringify(data, null, 2)
    );
}

// Check application configuration
app.get("/api/status", (req, res) => {
    const data = getBalanceData();

    res.json({
        configured: !!data,
        balance: data ? data.balance : null
    });
});

// Configure initial balance
app.post("/api/setup", (req, res) => {
    const existingData = getBalanceData();

    if (existingData) {
        return res.status(400).json({
            success: false,
            message: "Initial balance is already configured."
        });
    }

    const { balance } = req.body;

    if (!Number.isSafeInteger(balance) || balance < 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid balance in paise."
        });
    }

    const data = {
        initialBalance: balance,
        balance: balance,
        transactions: [],
        createdAt: new Date().toISOString()
    };

    saveBalanceData(data);

    res.json({
        success: true,
        message: "PocketBalance configured successfully.",
        balance: data.balance
    });
});

// Get current balance
app.get("/api/balance", (req, res) => {
    const data = getBalanceData();

    if (!data) {
        return res.status(400).json({
            configured: false,
            message: "Initial balance is not configured."
        });
    }

    res.json({
        configured: true,
        balance: data.balance,
        initialBalance: data.initialBalance,
        transactions: data.transactions
    });
});

// Serve application
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`PocketBalance running on port ${PORT}`);
});
