
document.addEventListener("DOMContentLoaded", function () {
    const speechSupported =
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window;

    const status = document.getElementById("accessibility-status");
    const speed = document.getElementById("reading-speed");

    const launcher = document.getElementById("accessibility-launcher");
    const panel = document.getElementById("accessibility-panel");
    const closeButton = document.getElementById("accessibility-close");

    let textSize = 100;
    let highContrast = false;
    let reduceMotion = false;
    let speechChunks = [];
    let chunkIndex = 0;
    let isReading = false;
    let isPaused = false;

    function announce(message) {
        if (status) status.textContent = message;
    }

    /* OPEN AND CLOSE ACCESSIBILITY PANEL */
    function setPanel(open) {
        if (!panel || !launcher) return;

        panel.hidden = !open;
        launcher.setAttribute("aria-expanded", String(open));

        if (open && closeButton) {
            closeButton.focus();
        } else if (!open) {
            launcher.focus();
        }
    }

    launcher?.addEventListener("click", function () {
        setPanel(panel.hidden);
    });

    closeButton?.addEventListener("click", function () {
        setPanel(false);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && panel && !panel.hidden) {
            setPanel(false);
        }
    });

    /* GET CLEAN MAIN PAGE TEXT */
    function getReadableText() {
        const main = document.querySelector("main");
        if (!main) return "";

        const clone = main.cloneNode(true);

        clone.querySelectorAll(
            "script, style, button, input, select, textarea, " +
            "[aria-hidden='true'], [hidden]"
        ).forEach(element => element.remove());

        return (clone.innerText || clone.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    /* SPLIT LONG TEXT INTO SMALL SPEECH CHUNKS */
    function splitIntoChunks(text, maxLength = 220) {
        const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
        const chunks = [];
        let current = "";

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (!sentence) return;

            if ((current + " " + sentence).length <= maxLength) {
                current = current ? current + " " + sentence : sentence;
            } else {
                if (current) chunks.push(current);

                while (sentence.length > maxLength) {
                    let splitAt = sentence.lastIndexOf(" ", maxLength);
                    if (splitAt < 1) splitAt = maxLength;

                    chunks.push(sentence.slice(0, splitAt).trim());
                    sentence = sentence.slice(splitAt).trim();
                }

                current = sentence;
            }
        });

        if (current) chunks.push(current);
        return chunks;
    }

    /* READ ALOUD */
    function speakNextChunk() {
        if (!speechSupported || !isReading || isPaused) return;

        if (chunkIndex >= speechChunks.length) {
            isReading = false;
            isPaused = false;
            announce("Reading completed.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(
            speechChunks[chunkIndex]
        );

        utterance.rate = Number(speed?.value || 1);
        utterance.lang = "en-GB";

        utterance.onend = function () {
            if (!isReading || isPaused) return;
            chunkIndex++;
            speakNextChunk();
        };

        utterance.onerror = function (event) {
            if (event.error === "canceled" || event.error === "interrupted") {
                return;
            }

            isReading = false;
            isPaused = false;
            announce("Reading could not be completed. Please try again.");
        };

        window.speechSynthesis.speak(utterance);
    }

    document.getElementById("read-play")?.addEventListener("click", function () {
        if (!speechSupported) {
            announce("Read Aloud is not supported by this browser.");
            return;
        }

        window.speechSynthesis.cancel();

        const text = getReadableText();

        if (!text) {
            announce("No readable page content was found.");
            return;
        }

        speechChunks = splitIntoChunks(text);
        chunkIndex = 0;
        isReading = true;
        isPaused = false;

        announce("Starting to read the page.");
        speakNextChunk();
    });

    document.getElementById("read-pause")?.addEventListener("click", function () {
        if (speechSupported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            isPaused = true;
            announce("Reading paused.");
        }
    });

    document.getElementById("read-resume")?.addEventListener("click", function () {
        if (!speechSupported) return;

        if (isPaused) {
            isPaused = false;
            window.speechSynthesis.resume();
            announce("Reading resumed.");
        } else if (isReading && !window.speechSynthesis.speaking) {
            speakNextChunk();
        }
    });

    document.getElementById("read-stop")?.addEventListener("click", function () {
        if (speechSupported) window.speechSynthesis.cancel();

        isReading = false;
        isPaused = false;
        speechChunks = [];
        chunkIndex = 0;

        announce("Reading stopped.");
    });

    /* TEXT SIZE */
    document.getElementById("text-smaller")?.addEventListener("click", function () {
        textSize = Math.max(80, textSize - 10);
        document.querySelector("main").style.fontSize = textSize + "%";
        announce("Text size decreased.");
    });

   document.getElementById("text-normal")?.addEventListener("click", function () {
    textSize = 100;

    const main = document.querySelector("main");

    if (main) {
        main.style.fontSize = "";
    }

    document.documentElement.style.fontSize = "";

    announce("Text size reset to normal.");
});

    document.getElementById("text-larger")?.addEventListener("click", function () {
        textSize = Math.min(140, textSize + 10);
        document.querySelector("main").style.fontSize = textSize + "%";
        announce("Text size increased.");
    });

    /* HIGH CONTRAST */
    document.getElementById("contrast-toggle")?.addEventListener("click", function () {
        highContrast = !highContrast;
        document.body.classList.toggle("high-contrast", highContrast);

        this.setAttribute("aria-pressed", String(highContrast));
        announce(highContrast ? "High contrast enabled." : "High contrast disabled.");
    });

    /* REDUCE MOTION */
    document.getElementById("motion-toggle")?.addEventListener("click", function () {
        reduceMotion = !reduceMotion;
        document.body.classList.toggle("reduce-motion", reduceMotion);

        this.setAttribute("aria-pressed", String(reduceMotion));
        announce(reduceMotion ? "Reduced motion enabled." : "Reduced motion disabled.");
    });

    /* RESET SETTINGS */
    document.getElementById("accessibility-reset")?.addEventListener("click", function () {
        if (speechSupported) window.speechSynthesis.cancel();

        isReading = false;
        isPaused = false;
        speechChunks = [];
        chunkIndex = 0;

        textSize = 100;
        highContrast = false;
        reduceMotion = false;

        document.querySelector("main").style.fontSize = "";
        document.body.classList.remove("high-contrast", "reduce-motion");

        if (speed) speed.value = "1";

        document.getElementById("contrast-toggle")
            ?.setAttribute("aria-pressed", "false");

        document.getElementById("motion-toggle")
            ?.setAttribute("aria-pressed", "false");

        announce("Accessibility settings have been reset.");
    });
});
