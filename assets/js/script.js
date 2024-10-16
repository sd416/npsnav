document.addEventListener("DOMContentLoaded", function() {
    const fundTable = document.getElementById("fundTableBody");
    const headers = document.querySelectorAll("#fundTable th");
    const showAllButton = document.getElementById("showAllButton");
    const filterInput = document.getElementById("filterInput");
    let rows = Array.from(fundTable.rows);

    let numFundsToShow = 10; // Number of funds to show initially
    let allFundsShown = false;
    let filterText = ''; // Variable to store the filter text

    // Simple fuzzy match function
    function fuzzyMatch(fundName, filterText) {
        fundName = fundName.toLowerCase();
        filterText = filterText.toLowerCase();

        let fundIndex = 0;
        let filterIndex = 0;

        while (fundIndex < fundName.length && filterIndex < filterText.length) {
            if (fundName[fundIndex] === filterText[filterIndex]) {
                filterIndex++;
            }
            fundIndex++;
        }

        return filterIndex === filterText.length;
    }

    // Function to render the table based on the number of funds to show and filter text
    function renderTable() {
        // Clear the table first
        fundTable.innerHTML = '';

        // Filter rows based on the filter text using simple fuzzy matching
        const filteredRows = rows.filter(row => {
            const fundName = row.cells[0].innerText.trim();
            if (filterText.trim() === '') {
                return true; // Include all rows when no filter
            } else {
                return fuzzyMatch(fundName, filterText.trim());
            }
        });

        // Get the rows to display
        const rowsToDisplay = allFundsShown
            ? filteredRows
            : filteredRows.slice(0, numFundsToShow);

        // Append the rows to the table
        rowsToDisplay.forEach(row => fundTable.appendChild(row));

        // Toggle the "Show All" button visibility
        if (filteredRows.length > numFundsToShow && !allFundsShown) {
            showAllButton.style.display = 'block';
        } else {
            showAllButton.style.display = 'none';
        }
    }

    // Function to sort table
    function sortTable(columnIndex, isNumeric, ascending) {
        rows.sort((a, b) => {
            let aText = a.cells[columnIndex].innerText.trim();
            let bText = b.cells[columnIndex].innerText.trim();

            // Handle "-" values explicitly: treat them as a special case
            if (aText === '-') aText = ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
            if (bText === '-') bText = ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

            if (isNumeric) {
                aText = parseFloat(aText);
                bText = parseFloat(bText);
                return ascending ? aText - bText : bText - aText;
            } else {
                return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
            }
        });

        // Re-render the table after sorting
        renderTable();
    }

    // Add click event to each header for sorting
    headers.forEach((header, index) => {
        header.classList.add('sortable');
        header.addEventListener("click", function() {
            const isNumeric = index !== 0; // Assume all columns except the first are numeric
            const isAscending = !this.classList.contains("sorted-asc");

            // Remove sorting classes from all headers
            headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));

            // Add appropriate sorting class to clicked header
            this.classList.add(isAscending ? "sorted-asc" : "sorted-desc");

            sortTable(index, isNumeric, isAscending);
        });
    });

    // Add event listener for "Show All" button
    showAllButton.addEventListener("click", function() {
        allFundsShown = true;
        renderTable();
    });

    // Add event listener for filter input
    filterInput.addEventListener("input", function() {
        filterText = this.value;
        allFundsShown = false; // Reset to show limited rows when filtering
        renderTable();
    });

    // Default sort by 5Y column (index 9) in descending order
    const fiveYearHeader = headers[9]; // Adjust the index if needed
    fiveYearHeader.classList.add("sorted-desc");
    sortTable(9, true, false);

    // Initial rendering of the table
    renderTable();
});
