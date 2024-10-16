document.addEventListener("DOMContentLoaded", function() {
    const fundTable = document.getElementById("fundTableBody");
    const headers = document.querySelectorAll("#fundTable th");
    const showAllButton = document.getElementById("showAllButton");
    const filterInput = document.getElementById("filterInput");
    let rows = Array.from(fundTable.rows);

    let numFundsToShow = 10; // Variable for home page table pagination
    let allFundsShown = false;
    let filterText = ''; // Variable to store the filter text

    // Function to calculate Levenshtein distance
    function levenshteinDistance(a, b) {
        const an = a.length;
        const bn = b.length;
        if (an === 0) return bn;
        if (bn === 0) return an;

        const matrix = [];

        // Initialize the first row and column of the matrix
        for (let i = 0; i <= an; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= bn; j++) {
            matrix[0][j] = j;
        }

        // Fill the matrix
        for (let i = 1; i <= an; i++) {
            for (let j = 1; j <= bn; j++) {
                const cost = a.charAt(i - 1).toLowerCase() === b.charAt(j - 1).toLowerCase() ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // Deletion
                    matrix[i][j - 1] + 1,      // Insertion
                    matrix[i - 1][j - 1] + cost // Substitution
                );
            }
        }
        return matrix[an][bn];
    }

    // Function to calculate similarity score
    function getSimilarity(a, b) {
        const maxLen = Math.max(a.length, b.length);
        if (maxLen === 0) return 1; // Both strings are empty
        const distance = levenshteinDistance(a, b);
        return (maxLen - distance) / maxLen;
    }

    // Function to render the table based on the number of funds to show and filter text
    function renderTable() {
        // Clear the table first
        fundTable.innerHTML = '';

        // Filter and sort rows based on the similarity score
        let filteredRows = rows.map(row => {
            const fundName = row.cells[0].innerText.trim();
            let similarity = 0;

            if (filterText.trim() === '') {
                similarity = 1; // Maximum similarity when there's no filter
            } else {
                similarity = getSimilarity(fundName, filterText.trim());
            }

            return { row, similarity };
        });

        // Filter out rows below a certain similarity threshold
        const threshold = 0.4; // Adjust this value as needed
        filteredRows = filteredRows.filter(item => item.similarity >= threshold);

        // Sort the filtered rows by similarity score in descending order
        filteredRows.sort((a, b) => b.similarity - a.similarity);

        // Get the rows to display
        const rowsToDisplay = allFundsShown
            ? filteredRows
            : filteredRows.slice(0, numFundsToShow);

        // Append the rows to the table
        rowsToDisplay.forEach(item => fundTable.appendChild(item.row));

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
    const fiveYearHeader = headers[9]; // 5Y column
    fiveYearHeader.classList.add("sorted-desc");
    sortTable(9, true, false);

    // Initial rendering of the table
    renderTable();
});
