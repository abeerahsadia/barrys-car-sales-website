document.addEventListener("DOMContentLoaded", function () {

    // SUV ENQUIRY LINK
    const suvEnquiryLink = document.getElementById("suv-enquiry");

    if (suvEnquiryLink) {
        suvEnquiryLink.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "enquiry.html";
        });
    }

    // ENQUIRY FORM
    const enquiryForm = document.getElementById("enquiry-form");
    const formStatus = document.getElementById("form-status");

    if (enquiryForm) {

        enquiryForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Check required fields
            if (!enquiryForm.checkValidity()) {
                enquiryForm.reportValidity();
                return;
            }

            // Check contact preference
            const contactMethod = enquiryForm.querySelector(
                'input[name="contact-method"]:checked'
            );

            const telephone = document.getElementById("telephone");

            if (
                contactMethod &&
                contactMethod.value === "Phone" &&
                telephone.value.trim() === ""
            ) {
                formStatus.hidden = false;
                formStatus.textContent =
                    "Please enter your telephone number if you prefer to be contacted by phone.";

                telephone.focus();
                return;
            }

            // Demo submission confirmation
            if (formStatus) {
                formStatus.hidden = false;
                formStatus.textContent =
                    "Your enquiry has been submitted successfully!";
            }

            // Redirect to Thank You page
            window.location.href = "thankyou.html";
        });

        // Clear status when the visitor edits the form
        enquiryForm.addEventListener("input", function () {
            if (formStatus) {
                formStatus.hidden = true;
                formStatus.textContent = "";
            }
        });

        enquiryForm.addEventListener("change", function () {
            if (formStatus) {
                formStatus.hidden = true;
                formStatus.textContent = "";
            }
        });
    }

});
/* =========================================
   SHOWROOM AUTOMATIC IMAGE CAROUSEL
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const carousel = document.getElementById("showroom-carousel");

    if (!carousel) return;

    const slides = carousel.querySelectorAll(".showroom-slide");
    const dots = carousel.querySelectorAll(".showroom-dot");
    const prevButton = carousel.querySelector(".showroom-prev");
    const nextButton = carousel.querySelector(".showroom-next");
    const counter = carousel.querySelector(".current-slide");

    let currentIndex = 0;
    let autoSlide;

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showSlide(index) {

        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);

            if (i === currentIndex) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        counter.textContent = String(currentIndex + 1).padStart(2, "0");
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function previousSlide() {
        showSlide(currentIndex - 1);
    }

    function startAutoSlide() {

        clearInterval(autoSlide);

        if (prefersReducedMotion) return;

        autoSlide = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlide);
    }

    nextButton.addEventListener("click", function () {
        nextSlide();
        startAutoSlide();
    });

    prevButton.addEventListener("click", function () {
        previousSlide();
        startAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", function () {
            showSlide(index);
            startAutoSlide();
        });
    });

    // Pause while the visitor hovers over the carousel
    carousel.addEventListener("mouseenter", stopAutoSlide);

    carousel.addEventListener("mouseleave", startAutoSlide);

    // Pause when navigating with keyboard focus
    carousel.addEventListener("focusin", stopAutoSlide);

    carousel.addEventListener("focusout", startAutoSlide);

    // Mobile swipe support
    let touchStartX = 0;

    carousel.addEventListener("touchstart", function (event) {
        touchStartX = event.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    carousel.addEventListener("touchend", function (event) {

        const touchEndX = event.changedTouches[0].screenX;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }

        startAutoSlide();

    }, { passive: true });

    showSlide(0);
    startAutoSlide();

});

