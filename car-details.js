
document.addEventListener("DOMContentLoaded", function () {
    const vehicles = window.BARRYS_VEHICLES || [];

    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("id");

    const vehicle = vehicles.find(function (car) {
        return car.id === vehicleId;
    });

    const mainImage = document.getElementById("vehicle-image");
    const thumbnails = document.getElementById("vehicle-thumbnails");

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value ?? "—";
        }
    }

    function formatPrice(price) {
        return Number(price).toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0
        });
    }

    function formatMileage(mileage) {
        return Number(mileage).toLocaleString("en-GB") + " miles";
    }

    // Show an error if the requested vehicle cannot be found.
    if (!vehicle) {
        document.querySelector(".vehicle-detail-page").innerHTML = `
            <div class="no-results">
                <h2>Vehicle Not Found</h2>
                <p>Sorry, this vehicle could not be found.</p>
                <a href="vehicle-search.html" class="primary-button">
                    Browse Available Vehicles
                </a>
            </div>
        `;
        return;
    }

    // VEHICLE INFORMATION
    document.title = vehicle.name + " | Barry's Car Sales";

    setText("vehicle-year", vehicle.year);
    setText("vehicle-name", vehicle.name);
    const formattedPrice = "£" + Number(vehicle.price).toLocaleString("en-GB");

setText("vehicle-price", formattedPrice);
setText("spec-price", formattedPrice);
    setText("vehicle-mileage", formatMileage(vehicle.mileage));
    setText("vehicle-fuel", vehicle.fuel);
    setText("vehicle-transmission", vehicle.transmission);
    setText("vehicle-doors", vehicle.doors);

    setText("spec-year", vehicle.year);
    setText("spec-mileage", formatMileage(vehicle.mileage));
    setText("spec-fuel", vehicle.fuel);
    setText("spec-transmission", vehicle.transmission);
    setText("spec-type", vehicle.type);
    setText("spec-doors", vehicle.doors);

    setText(
    "vehicle-description",
    `Discover the ${vehicle.year} ${vehicle.name}, available from Barry's Car Sales. 
    This vehicle has covered ${Number(vehicle.mileage).toLocaleString("en-GB")} miles 
    and features ${vehicle.fuel.toLowerCase()} power with a 
    ${vehicle.transmission.toLowerCase()} transmission. With ${vehicle.doors} doors, 
    it offers a practical option for everyday journeys and longer drives. 
    Explore the photographs and specifications to learn more, or contact our 
    team to arrange a viewing and confirm the vehicle's current availability.`
);

    // ENQUIRY LINK
    const enquiryLink = document.getElementById("vehicle-enquiry-link");

    if (enquiryLink) {
        enquiryLink.href =
            "enquiry.html?vehicle=" + encodeURIComponent(vehicle.name);
    }

    // VEHICLE IMAGE GALLERY
    const imageFiles = [
        vehicle.image,
        ...(Array.isArray(vehicle.gallery) ? vehicle.gallery : [])
    ].filter(Boolean);

    const uniqueImages = [...new Set(imageFiles)];

    let visibleImages = [];

    function showMainImage(imagePath, altText) {
        if (!mainImage) return;

        mainImage.onerror = function () {
            mainImage.style.display = "none";
            mainImage.alt = "Vehicle photograph unavailable";
        };

        mainImage.onload = function () {
            mainImage.style.display = "block";
        };

        mainImage.src = imagePath;
        mainImage.alt = altText;
    }

    function renderGallery() {
        if (!mainImage || !thumbnails) return;

        thumbnails.innerHTML = "";

        if (visibleImages.length === 0) {
            mainImage.style.display = "none";

            const message = document.createElement("p");
            message.textContent = "Vehicle photographs are currently unavailable.";
            thumbnails.appendChild(message);
            return;
        }

        showMainImage(visibleImages[0], vehicle.name);

        visibleImages.forEach(function (imagePath, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "vehicle-thumbnail-button";
            button.setAttribute(
                "aria-label",
                "View vehicle photo " + (index + 1)
            );

            const image = document.createElement("img");
            image.src = imagePath;
            image.alt = vehicle.name + " photo " + (index + 1);

            image.onerror = function () {
                button.remove();

                visibleImages = visibleImages.filter(function (path) {
                    return path !== imagePath;
                });

                if (visibleImages.length === 0) {
                    mainImage.style.display = "none";
                }
            };

            button.appendChild(image);

            button.addEventListener("click", function () {
                showMainImage(imagePath, vehicle.name);
            });

            thumbnails.appendChild(button);
        });
    }

    // Check which gallery photos actually exist.
    function checkGalleryImages() {
        if (uniqueImages.length === 0) {
            renderGallery();
            return;
        }

        let checked = 0;

        uniqueImages.forEach(function (imagePath) {
            const testImage = new Image();

            testImage.onload = function () {
                visibleImages.push(imagePath);
                checked++;

                if (checked === uniqueImages.length) {
                    renderGallery();
                }
            };

            testImage.onerror = function () {
                checked++;

                if (checked === uniqueImages.length) {
                    renderGallery();
                }
            };

            testImage.src = imagePath;
        });
    }

    checkGalleryImages();


    // RELATED VEHICLES
    const relatedContainer = document.getElementById("related-vehicles");

    if (relatedContainer) {
        const relatedVehicles = vehicles
            .filter(function (car) {
                return car.id !== vehicle.id;
            })
            .sort(function (a, b) {
                const aMatch = a.type === vehicle.type ? 1 : 0;
                const bMatch = b.type === vehicle.type ? 1 : 0;

                return bMatch - aMatch;
            })
            .slice(0, 3);

        relatedContainer.innerHTML = "";

        relatedVehicles.forEach(function (car) {
            const card = document.createElement("article");
            card.className = "car-card";

            const imageWrapper = document.createElement("div");
            imageWrapper.className = "car-image-wrapper";

            const image = document.createElement("img");
            image.src = car.image;
            image.alt = car.name;
            image.loading = "lazy";

            image.onerror = function () {
                image.style.display = "none";
                imageWrapper.classList.add("image-unavailable");
            };

            imageWrapper.appendChild(image);

            const info = document.createElement("div");
            info.className = "car-info";

            const year = document.createElement("p");
            year.className = "car-year";
            year.textContent = car.year;

            const name = document.createElement("h3");
            name.className = "car-title";
            name.textContent = car.name;

            const price = document.createElement("p");
            price.className = "car-price";
            price.textContent = formatPrice(car.price);

            const link = document.createElement("a");
            link.className = "car-enquiry-link";
            link.href = "car-details.html?id=" + encodeURIComponent(car.id);
            link.textContent = "View Details";

            info.append(year, name, price, link);
            card.append(imageWrapper, info);
            relatedContainer.appendChild(card);
        });
    }


    // FINANCE CALCULATOR
    const priceInput = document.getElementById("finance-price");
    const depositInput = document.getElementById("finance-deposit");
    const aprInput = document.getElementById("finance-apr");
    const termInput = document.getElementById("finance-term");

    const calculateButton = document.getElementById("calculate-finance");
    const monthlyPayment = document.getElementById("monthly-payment");
    const financeSummary = document.getElementById("finance-summary");
    const financeError = document.getElementById("finance-error");

    if (priceInput) {
        priceInput.value = vehicle.price;
    }

    function calculateFinance() {
        const price = Number(priceInput?.value);
        const deposit = Number(depositInput?.value);
        const apr = Number(aprInput?.value);
        const months = Number(termInput?.value);

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
            if (financeError) {
                financeError.textContent =
                    "Please enter valid finance details. Your deposit must be less than the vehicle price.";
            }

            if (monthlyPayment) {
                monthlyPayment.textContent = "—";
            }

            if (financeSummary) {
                financeSummary.textContent =
                    "Please correct the figures and try again.";
            }

            return;
        }

        if (financeError) {
            financeError.textContent = "";
        }

        const amountBorrowed = price - deposit;
        const monthlyRate = apr / 1200;

        let monthlyAmount;

        if (monthlyRate === 0) {
            monthlyAmount = amountBorrowed / months;
        } else {
            monthlyAmount =
                amountBorrowed *
                monthlyRate /
                (1 - Math.pow(1 + monthlyRate, -months));
        }

        const totalPaid = monthlyAmount * months;
        const interest = totalPaid - amountBorrowed;

        if (monthlyPayment) {
            monthlyPayment.textContent = formatPrice(monthlyAmount);
        }

        if (financeSummary) {
            financeSummary.textContent =
                `${months} months • ${months} monthly payments • ` +
                `Estimated interest: ${formatPrice(interest)}.`;
        }
    }

    if (calculateButton) {
        calculateButton.addEventListener("click", calculateFinance);
    }

    // Calculate again whenever the user changes an input.
    [priceInput, depositInput, aprInput, termInput].forEach(input => {
        if (input) {
            input.addEventListener("change", calculateFinance);
        }
    });

    // Initial estimate
    calculateFinance();
});
