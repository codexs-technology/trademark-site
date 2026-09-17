function responsivefy(svg) {
    // Container is the DOM element, svg is appended.
    // Then we measure the container and find its
    // aspect ratio.
    const container = d3.select(svg.node().parentNode),
        parentElement = document.getElementById(container.attr('id')),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10),
        aspect = width / height;

    // Add viewBox attribute to set the value to initial size
    // add preserveAspectRatio attribute to specify how to scale
    // and call resize so that svg resizes on page load
    svg.attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMinYMid')
        .call(resize);

    d3.select(window).on('resize.' + container.attr('id'), resize);

    function resize() {
        const targetWidth = parseInt(container.style('width'));
        svg.attr('width', targetWidth);
        svg.attr('height', Math.round(targetWidth / aspect));
        //let ticks = d3.selectAll(".tick");
        //ticks.style('font-size', 11 * (width / targetWidth));
        //let labels = d3.selectAll(".axis-label");
        //labels.style('font-size', 13 * (width / targetWidth));
    }
}

/* function to wrap text in svg */
function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                if (line.length > 1) { line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);}
            }
        }
    });
}

function formatStringToNumber(value) {
    let returnValue = value ? value.replace(/,/g, "").replace(/%/g, "") : 0;
    return returnValue;
}

// The table generation function
function generateDataTable(dataItemId, chartData, chartType) {
    let tableId = '#' + dataItemId + '-data-table';

    let chartDataTable;

    let table = d3.select(tableId);

    if (table) {
        let thead = table.append("thead"),
            tbody = table.append("tbody");

        if (chartType === "line") {
            //console.log(chartData);
            let lineChartData = [];
            lineChartData['columns'] = ['Date'];
            chartData.dates.forEach(function (dateItem, i) {
                let myObj = {};
                myObj.Date = checkValidDate(dateItem);
                chartData.series.forEach(function (item) {
                    myObj[item.name] = item.values[i];
                    if (i === 0) {
                        lineChartData['columns'].push(item.name);
                    }
                });
                lineChartData.push(myObj);
            });

            chartDataTable = lineChartData;
        }
        else if (chartType === "pie") {
            chartDataTable = JSON.parse(JSON.stringify(chartData));;
            chartDataTable.forEach(function (dataItem) {
                Object.defineProperty(dataItem, chartData.columns[0], Object.getOwnPropertyDescriptor(dataItem, 'name'));
                delete dataItem['name'];
                Object.defineProperty(dataItem, chartData.columns[1], Object.getOwnPropertyDescriptor(dataItem, 'value'));
                delete dataItem['value'];
            });
            chartDataTable['columns'] = chartData['columns'];
        }
        else {
            chartDataTable = chartData;
        }

        //console.log(chartDataTable);

        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(chartDataTable.columns)
            .enter()
            .append("th").attr("scope", "col")
            .text(function (column) { return column !== 'x' ? column : 'Reporting Period'; });

        // create a row for each object in the data
        let rows = tbody.selectAll("tr")
            .data(chartDataTable)
            .enter()
            .append("tr");

        // create a cell in each row for each column
        let cells = rows.selectAll("td")
            .data(function (row) {
                return chartDataTable.columns.map(function (column) {
                    if (column === 'x') {
                        return { column: column, value: formatTime(row[column]) };
                    } else {
                        return { column: column, value: row[column] };
                    }
                });
            })
            .enter()
            .append("td")
            .html(function (d) { return d.value; });

        return table;
    }
}

function getFiscalQuarterRange(quarter) {
    const start = moment().quarter(quarter).startOf('quarter');
    start.subtract(3, "month");
    const end = moment().quarter(quarter).endOf('quarter');
    end.subtract(3, "month");
    return { start: start, end: end };
}

let formatShortTime = d3.timeFormat("%b-%y");

function checkValidDate(dateTestObject) {
    if (Object.prototype.toString.call(dateTestObject) === "[object Date]") {
        // it is a date
        if (isNaN(dateTestObject.getTime())) {
            // date is not valid
            return dateTestObject;
        } else {
            // date is valid
            return formatShortTime(dateTestObject);
        }
    } else {
        // not a date
        return dateTestObject;
    }
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getContrastColor(rgb) {
    let brightness = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;

    return brightness > 150 ? "#000000" : "#FFFFFF";
}

