
document.addEventListener("DOMContentLoaded", function () {

    const accordions = document.querySelectorAll(".accordion");

    // Get temple name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemple = urlParams.get("temple");

    accordions.forEach((accordion) => {

        const btn = accordion.querySelector(".accordion-btn");
        const content = accordion.querySelector(".accordion-content");
        const icon = accordion.querySelector(".icon");

        // Initially hide all content
        content.style.display = "none";
        icon.textContent = "⮟";

        // Click event
        btn.addEventListener("click", function () {

            if (content.style.display === "block") {

                content.style.display = "none";
                icon.textContent = "⮟";

            } else {

                content.style.display = "block";
                icon.textContent = "−";

            }

        });

        // Automatically open selected sannidhi
        if (accordion.id === selectedTemple) {

            content.style.display = "block";
            icon.textContent = "−";

            // Scroll to that section
            setTimeout(() => {
                accordion.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 300);

        }

    });

});