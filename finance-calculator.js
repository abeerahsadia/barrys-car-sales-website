
document.addEventListener("DOMContentLoaded", function () {
    const priceInput = document.getElementById("finance-price");
    const depositInput = document.getElementById("finance-deposit");
    const aprInput = document.getElementById("finance-apr");
    const termInput = document.getElementById("finance-term");

    const calculateButton = document.getElementById("calculate-finance");
    const monthlyOutput = document.getElementById("monthly-payment");
    const summaryOutput = document.getElementById("finance-summary");
    const errorOutput = document.getElementById("finance-error");

    if (!calculateButton) return;

    function calculateFinance() {
        const price = Number(priceInput.value);
        const deposit = Number(depositInput.value);
        const apr = Number(aprInput.value);
        const months = Number(termInput.value);

        errorOutput.textContent = "";
        monthlyOutput.textContent = "£0.00";
        summaryOutput.textContent = "";

        if (
            !Number.isFinite(price) ||
            !Number.isFinite(deposit) ||
            !Number.isFinite(apr) ||
            !Number.isFinite(months) ||
            price <= 0 ||
            deposit < 0 ||
            deposit >= price ||
            apr < 0 ||
            apr > 100 ||
            months <= 0
        ) {
            errorOutput.textContent =
                "Please enter a valid vehicle price, deposit, APR and repayment period.";
            return;
        }

        const amountBorrowed = price - deposit;
        const monthlyRate = apr / 100 / 12;

        let monthlyPayment;

        if (monthlyRate === 0) {
            monthlyPayment = amountBorrowed / months;
        } else {
            monthlyPayment =
                amountBorrowed * monthlyRate /
                (1 - Math.pow(1 + monthlyRate, -months));
        }

        const totalRepayment = monthlyPayment * months;
        const totalInterest = totalRepayment - amountBorrowed;

        monthlyOutput.textContent = monthlyPayment.toLocaleString(
            "en-GB",
            { style: "currency", currency: "GBP" }
        );

        summaryOutput.textContent =
            "Amount financed: " +
            amountBorrowed.toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            }) +
            " | Estimated interest: " +
            totalInterest.toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            }) +
            " | Total instalments: " +
            totalRepayment.toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            });
    }

    calculateButton.addEventListener("click", calculateFinance);

    [priceInput, depositInput, aprInput, termInput].forEach(function (field) {
        field.addEventListener("change", calculateFinance);
    });

    calculateFinance();
});
