
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tagSelect");
    const control = document.getElementById("tagSelectControl");
    const dropdown = document.getElementById("tagDropdown");
    const selectedTags = document.getElementById("selectedTags");
    const searchInput = document.getElementById("tagSearch");
    const clearButton = document.getElementById("clearTags");
    const applyButton = document.getElementById("applyTags");
    const noResults = document.querySelector(".tag-no-results");

    const checkboxes = [
        ...container.querySelectorAll(".tag-checkbox")
    ];

    function openDropdown() {
        dropdown.hidden = false;
        container.classList.add("is-open");
        control.setAttribute("aria-expanded", "true");
        searchInput.focus();
    }

    function closeDropdown() {
        dropdown.hidden = true;
        container.classList.remove("is-open");
        control.setAttribute("aria-expanded", "false");
        searchInput.value = "";
        filterOptions();
    }

    // Display selected categories as chips
    function renderTags() {
        selectedTags.replaceChildren();

        const selected = checkboxes.filter(
            checkbox => checkbox.checked
        );

        if (selected.length === 0) {
            const placeholder = document.createElement("span");
            placeholder.className = "tag-placeholder";
            placeholder.textContent = "Choose categories...";
            selectedTags.appendChild(placeholder);
            return;
        }

        selected.forEach(checkbox => {
            const chip = document.createElement("span");
            chip.className = "tag-chip";

            const label = document.createElement("span");
            label.textContent = checkbox.value;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "tag-remove";
            removeButton.textContent = "×";
            removeButton.setAttribute(
                "aria-label",
                `Remove ${checkbox.value}`
            );

            removeButton.addEventListener("click", event => {
                event.stopPropagation();
                checkbox.checked = false;
                renderTags();
            });

            chip.append(label, removeButton);
            selectedTags.appendChild(chip);
        });
    }

    // Filter options while typing
    function filterOptions() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        container.querySelectorAll(".tag-option").forEach(option => {
            const checkbox = option.querySelector(".tag-checkbox");

            const matches = checkbox.value
                .toLowerCase()
                .includes(query);

            option.hidden = !matches;

            if (matches) visibleCount++;
        });

        noResults.hidden = visibleCount > 0;
    }

    // Open or close the menu
    control.addEventListener("click", () => {
        if (dropdown.hidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    });

    // Keyboard support
    control.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (dropdown.hidden) {
                openDropdown();
            } else {
                closeDropdown();
            }
        }

        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    // Update chips after selecting a category
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", renderTags);
    });

    searchInput.addEventListener("input", filterOptions);

    // Clear every selection
    clearButton.addEventListener("click", () => {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        renderTags();
    });

    // Apply selections and close
    applyButton.addEventListener("click", closeDropdown);

    // Close when clicking outside
    document.addEventListener("click", event => {
        if (!container.contains(event.target)) {
            closeDropdown();
        }
    });

    // Render existing selections on page load
    renderTags();
});
