
const setupSection = document.getElementById("setupSection");
const dashboardSection = document.getElementById("dashboardSection");
const setupForm = document.getElementById("setupForm");
const balanceElement = document.getElementById("balance");
const messageElement = document.getElementById("message");

function formatCurrency(paise) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(paise / 100);
}

async function initializeApp() {
    try {
        const response = await fetch("/api/status");
        const result = await response.json();

        if (result.configured) {
            showDashboard();
        } else {
            showSetup();
        }
    } catch (error) {
        messageElement.textContent = "Unable to connect to server.";
    }
}

function showSetup() {
    setupSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
}

async function showDashboard() {
    const response = await fetch("/api/balance");
    const result = await response.json();

    if (!response.ok) {
        showSetup();
        return;
    }

    setupSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    balanceElement.textContent = formatCurrency(result.balance);
}

setupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rupees = Number(
        document.getElementById("initialBalance").value
    );

    if (!Number.isFinite(rupees) || rupees < 0 ||
        !Number.isSafeInteger(rupees * 100)) {
        messageElement.textContent = "Enter a valid balance.";
        return;
    }

    const balance = Math.round(rupees * 100);

    try {
        const response = await fetch("/api/setup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ balance })
        });

        const result = await response.json();

        if (!response.ok) {
            messageElement.textContent = result.message;
            return;
        }

        messageElement.textContent = result.message;
        await showDashboard();

    } catch (error) {
        messageElement.textContent = "Unable to configure balance.";
    }
});

initializeApp();
