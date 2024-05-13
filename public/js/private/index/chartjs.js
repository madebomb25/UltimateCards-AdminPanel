let graphColors = ["rgb(220, 38, 38)", "rgb(253, 224, 71)", "rgb(34, 197, 94)", "rgb(168, 85, 247)"];

let graphLabels = ["Type 1", "Type 2", "Type 3", "Type 4"];

/////////// COLORS GRAPH /////////////

let statsGraphData = {
    labels: graphLabels,
    datasets: [
        {
            data: [0, 0, 0, 0],
            backgroundColor: graphColors,
        },
    ],
};

let statsGraphOptions = {
    maintainAspectRatio: false,
    indexAxis: "y",
    borderRadius: 10,
    scales: {
        y: {
            display: false,
        },
        x: {

            display: true,
            min: 0,
            max: 40,
            ticks: {
                display: false,
            }
        },
    },
    responsive: true,

    plugins: {
        legend: {
            display: false,
        },
        datalabels: {
            color: "#111111",
            clip: true, // Recortar si no cabe
            align: "end",
            anchor: "end",
            font: {
                size: 18, // Tamaño de la fuente
                weight: "bold", // Fuente en negrita
            },
        },
    },
};

let colorsGraph = new Chart(colorsGraphE, {
    plugins: [ChartDataLabels],
    type: "bar",
    data: statsGraphData,
    options: statsGraphOptions,
});

