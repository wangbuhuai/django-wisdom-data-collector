// Created by Dayu Wang (dwang@stchas.edu) on 2022-03-22

// Last updated by Dayu Wang (dwang@stchas.edu) on 2022-03-24


function formatDateTime(date) {
    const year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) { month = '0' + month; }
    let day = date.getDate().toString();
    if (day.length === 1) { day = '0' + day; }
    let hour = date.getHours().toString();
    if (hour.length === 1) { hour = '0' + hour; }
    let minute = date.getMinutes().toString();
    if (minute.length === 1) { minute = '0' + minute; }
    return {
        "date" : `${year}-${month}-${day}`,
        "datetime" : `${year}-${month}-${day}T${hour}${minute}`
    };
}

document.addEventListener("DOMContentLoaded", () => {
    // Initialize date pickers.
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");
    const today = formatDateTime(new Date()).date;
    startDate.max = today;
    endDate.min = startDate.value;
    endDate.value = today;
    endDate.max = today;

    startDate.addEventListener("change", () => {
        const valOfStartDate = new Date(startDate.value);
        const valOfEndDate = new Date(endDate.value);
        if (valOfStartDate.getTime() > valOfEndDate.getTime()) { endDate.value = startDate.value; }
        endDate.min = startDate.value;
    });

    // Add effects to suggestions.
    const suggestionsOn = document.getElementById("suggestions-on");
    const suggestionsOff = document.getElementById("suggestions-off");
    const suggestions = document.getElementById("suggestions");
    suggestionsOn.addEventListener("change", () => {
        suggestions.disabled = !suggestionsOn.checked;
        suggestions.required = !suggestions.disabled;
        suggestions.style.color = suggestionsOn.checked ? "blue" : "gray";
    });
    suggestionsOff.addEventListener("change", () => {
        suggestions.disabled = suggestionsOff.checked;
        suggestions.required = !suggestions.disabled;
        suggestions.style.color = suggestionsOff.checked ? "gray" : "blue";
    });

    // Add function to reset the form.
    document.getElementById("form-reset").addEventListener("click", () => {
        startDate.value = "2004-01-01";
        startDate.min = "2004-01-01";
        startDate.max = today;
        endDate.value = today;
        endDate.min = startDate.value;
        endDate.max = today;
        document.getElementById("search-terms").value = "";
        suggestionsOn.checked = false;
        suggestionsOff.checked = true;
        suggestions.value = "";
        suggestionsOn.dispatchEvent(new Event("change"));
        document.getElementById("first-index").value = 1;
        document.getElementById("file-input").value = "";
        document.getElementById("output-link").href = "#";
        document.getElementById("output-link").download = null;
    });

    // Add function to output current form to a file.
    document.getElementById("export-file").addEventListener("click", () => {
        const searchTerms = document.getElementById("search-terms");
        if (searchTerms.value.trim() === "") {
            alert("[Error] \"Search terms\" cannot be empty.");
        } else if (!suggestions.disabled && suggestions.value.trim() === "") {
            alert("[Error] \"Suggestions\" cannot be empty if turned on.");
        } else {
            const firstIndex = parseInt(document.getElementById("first-index").value);
            const jsonData = {
                "start-date": startDate.value,
                "end-date": endDate.value,
                "search-terms": searchTerms.value.trim(),
                "suggestions": {
                    "turnedOn": !suggestions.disabled,
                    "content": suggestions.value.trim()
                },
                "first-index": firstIndex
            };
            const data = JSON.stringify(jsonData);
            const textToBLOB = new Blob([data], { type: 'text/plain' });
            const outputFilename = "Search_Input_-_" + formatDateTime(new Date()).datetime + ".txt";
            const link = document.getElementById("output-link");
            link.download = outputFilename;

            if (window.webkitURL != null) { link.href = window.webkitURL.createObjectURL(textToBLOB); }
            else { link.href = window.URL.createObjectURL(textToBLOB); }
            link.click();
            document.getElementById("form-reset").click();
        }
    });

    // Add function to import input file.

    const inputFileSelector = document.getElementById("file-input");
    inputFileSelector.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const inputData = JSON.parse(event.target.result.toString());
            startDate.value = inputData["start-date"];
            endDate.value = inputData["end-date"];
            startDate.dispatchEvent(new Event("change"));
            document.getElementById("search-terms").value = inputData["search-terms"];
            const suggestionSwitch = inputData["suggestions"]["turnedOn"];
            if (suggestionSwitch) {
                suggestionsOn.checked = true;
                suggestionsOff.checked = false;
                suggestionsOn.dispatchEvent(new Event("change"));
                suggestions.value = inputData["suggestions"]["content"];
            } else {
                suggestionsOn.checked = false;
                suggestionsOff.checked = true;
                suggestionsOn.dispatchEvent(new Event("change"));
                suggestions.value = inputData["suggestions"]["content"];
            }
            document.getElementById("first-index").value = parseInt(inputData["first-index"]);
        });
        reader.readAsText(file);
    });

    document.getElementById("import-file").addEventListener("click", () => {
        document.getElementById("form-reset").click();
        inputFileSelector.click();
    });
});