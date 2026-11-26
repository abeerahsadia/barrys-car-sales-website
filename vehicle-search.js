
document.addEventListener("DOMContentLoaded", () => {

    const vehicles = window.BARRYS_VEHICLES || [];

    const form = document.getElementById("vehicle-search-form");

    if (!form) {
        console.error("Vehicle search form not found.");
        return;
    }

    // Get HTML elements
    const get = id => document.getElementById(id);

    const nameInput = get("vehicle-name");
    const minPrice = get("min-price");
    const maxPrice = get("max-price");
    const typeInput = get("vehicle-type");
    const fuelInput = get("fuel-type");
    const transmissionInput = get("transmission");
    const mileageInput = get("max-mileage");
    const sortInput = get("sort-cars");

    const results = get("car-results-list");
    const count = get("results-count");
    const noResults = get("no-results");
    const clearButton = get("clear-filters");

    const money = price =>
        "£" + Number(price).toLocaleString("en-GB");

    const miles = mileage =>
        Number(mileage).toLocaleString("en-GB") + " miles";


    // Read category selected from homepage
    const requestedType =
        new URLSearchParams(window.location.search).get("type");

    const combinedElectricHybrid =
        requestedType &&
        requestedType.toLowerCase() === "electric hybrid";

    if (
        requestedType &&
        !combinedElectricHybrid &&
        typeInput &&
        [...typeInput.options].some(
            option =>
                option.value.toLowerCase() ===
                requestedType.toLowerCase()
        )
    ) {
        typeInput.value = [...typeInput.options].find(
            option =>
                option.value.toLowerCase() ===
                requestedType.toLowerCase()
        ).value;
    }


    // Filter vehicles
    function filteredCars() {

        const searchText = nameInput.value
            .trim()
            .toLowerCase();

        const minimum =
            minPrice.value === ""
                ? 0
                : Number(minPrice.value);

        const maximum =
            maxPrice.value === ""
                ? Infinity
                : Number(maxPrice.value);

        const maximumMileage =
            mileageInput.value === ""
                ? Infinity
                : Number(mileageInput.value);

        return vehicles.filter(car => {

            const searchableText = (
                car.name + " " +
                car.year + " " +
                car.type + " " +
                car.fuel
            ).toLowerCase();

            const matchesSearch =
                searchableText.includes(searchText);

            const matchesPrice =
                car.price >= minimum &&
                car.price <= maximum;

            const matchesType =
                !typeInput.value ||
                car.type === typeInput.value;

            const matchesFuel =
                !fuelInput.value ||
                car.fuel === fuelInput.value;

            const matchesTransmission =
                !transmissionInput.value ||
                car.transmission === transmissionInput.value;

            const matchesMileage =
                car.mileage <= maximumMileage;

            const matchesElectricHybrid =
                !combinedElectricHybrid ||
                car.fuel === "Electric" ||
                car.fuel === "Hybrid";

            return (
                matchesSearch &&
                matchesPrice &&
                matchesType &&
                matchesFuel &&
                matchesTransmission &&
                matchesMileage &&
                matchesElectricHybrid
            );
        });
    }


    // Sort vehicles
    function sortedCars(list) {

        const sorted = [...list];

        switch (sortInput.value) {

            case "price-low":
                sorted.sort((a, b) => a.price - b.price);
                break;

            case "price-high":
                sorted.sort((a, b) => b.price - a.price);
                break;

            case "mileage-low":
                sorted.sort((a, b) => a.mileage - b.mileage);
                break;

            case "year-new":
                sorted.sort((a, b) => b.year - a.year);
                break;
        }

        return sorted;
    }


    // Create a vehicle card
    function createCarCard(car) {

        const card = document.createElement("article");
        card.className = "car-card";

        // Image section
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "car-image-wrapper";

        const image = document.createElement("img");

        image.src = car.image;
        image.alt = car.year + " " + car.name;
        image.loading = "lazy";

        image.onerror = function () {
            this.style.display = "none";
            imageWrapper.classList.add("image-unavailable");
        };

        const badge = document.createElement("span");
        badge.className = "car-badge";
        badge.textContent = car.type.toUpperCase();

        imageWrapper.append(image, badge);


        // Information section
        const information = document.createElement("div");
        information.className = "car-info";

        const titleRow = document.createElement("div");
        titleRow.className = "car-title-row";

        const title = document.createElement("div");
        title.className = "car-title";

        const year = document.createElement("p");
        year.className = "car-year";
        year.textContent = car.year;

        const heading = document.createElement("h3");
        heading.textContent = car.name;

        title.append(year, heading);

        const price = document.createElement("div");
        price.className = "car-price";
        price.textContent = money(car.price);

        titleRow.append(title, price);


        // Vehicle specifications
        const specifications = document.createElement("div");
        specifications.className = "car-specs";

        const specificationItems = [
            miles(car.mileage),
            car.fuel,
            car.transmission,
            car.doors + " doors"
        ];

        specificationItems.forEach(item => {

            const span = document.createElement("span");
            span.textContent = item;

            specifications.appendChild(span);
        });


        // Details link
        const detailsLink = document.createElement("a");

        detailsLink.className = "car-enquiry-link";

        detailsLink.href =
            "car-details.html?id=" +
            encodeURIComponent(car.id);

        detailsLink.textContent = "View vehicle details →";

        information.append(
            titleRow,
            specifications,
            detailsLink
        );

        card.append(imageWrapper, information);

        return card;
    }


    // Display vehicles
    function updateVehicles() {

        const minimum = Number(minPrice.value);
        const maximum = Number(maxPrice.value);
        const mileage = Number(mileageInput.value);

        if (
            (minPrice.value && minimum < 0) ||
            (maxPrice.value && maximum < 0) ||
            (mileageInput.value && mileage < 0) ||
            (
                minPrice.value &&
                maxPrice.value &&
                minimum > maximum
            )
        ) {
            results.replaceChildren();

            count.textContent =
                "Please check your filter values.";

            noResults.hidden = true;

            return;
        }

        const filtered = sortedCars(filteredCars());

        results.replaceChildren();

        filtered.forEach(car => {
            results.appendChild(createCarCard(car));
        });

        count.textContent =
            filtered.length +
            (filtered.length === 1
                ? " vehicle found."
                : " vehicles found.");

        noResults.hidden = filtered.length !== 0;
    }


    // Search and filter events
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        updateVehicles();
    });

    form.addEventListener("input", updateVehicles);

    form.addEventListener("change", updateVehicles);


    // Clear filters
    if (clearButton) {

        clearButton.addEventListener("click", function () {

            form.reset();

            if (sortInput) {
                sortInput.value = "default";
            }

            updateVehicles();
        });
    }


    // Initial display
    updateVehicles();

});
