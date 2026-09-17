function gaugeChart() {
    let chartId,
        dataInfo,
        svg,
        chartSpace,
        currentValue,
        colors,
        margin = { top: 20, right: 30, bottom: 20, left: 30 },
        chartWidth = 300,
        chartHeight = 300,
        svgWidth,
        svgHeight = 400,
        widthTarget = 160,
        heightTarget = 160,
        anglesRange = 0.5 * Math.PI,
        radius,
        radiusTarget,
        thickness,
        thicknessTarget = 0,
        arcColor = '#004C97',
        arcColorTarget = ['#A6192E', '#F3D54E', '#007A33'],
        arcMultiplier,
        data,
        arcMultiplierTargetRed = 0.33,
        arcMultiplierTargetYellow = 0.67,
        pies = d3.pie(),
        arc = d3.arc(),
        backgroundSpace,
        actualSpace,
        actualItem,
        labelSpace,
        labelItem,
        rangeSpace,
        rangePosition,
        rangeStart,
        rangeEnd,
        dataTarget,
        arcTargets = d3.arc(),
        targetSpace,
        targetItem,
        unitsSpace,
        translation = function (x, y) { return "translate(" + x + ", " + y + ")" },
        showDate = true;

    function chart() {
        setDimensions();
        
        arcMultiplier = (currentValue - dataInfo.gaugeMin) / (dataInfo.gaugeMax - dataInfo.gaugeMin);
        data = [arcMultiplier, 1 - arcMultiplier];

        if (dataInfo.hasOwnProperty('midTarget')) {
            if (currentValue < dataInfo.midTarget.start) {
                arcColor = arcColorTarget[0];
            } else if (currentValue >= dataInfo.midTarget.start && currentValue <= dataInfo.midTarget.end) {
                arcColor = arcColorTarget[1];
            }
            else {
                arcColor = arcColorTarget[2];
            }
            if (dataInfo.targetReverse) {
                if (currentValue > dataInfo.midTarget.start) {
                    arcColor = arcColorTarget[0];
                } else if (currentValue <= dataInfo.midTarget.start && currentValue >= dataInfo.midTarget.end) {
                    arcColor = arcColorTarget[1];
                }
                else {
                    arcColor = arcColorTarget[2];
                }
            }

            arcMultiplierTargetRed = (dataInfo.midTarget.start - dataInfo.gaugeMin) / (dataInfo.gaugeMax - dataInfo.gaugeMin);
            arcMultiplierTargetYellow = (dataInfo.midTarget.end - dataInfo.midTarget.start - dataInfo.gaugeMin) / (dataInfo.gaugeMax - dataInfo.gaugeMin);
        }

        colors = [arcColor, "#e0e0e0"];

        pies.value(function (d) { return d; })
            .sort(null)
            .startAngle(anglesRange * -1)
            .endAngle(anglesRange);

        arc.outerRadius(radius)
            .innerRadius(radius - thickness);
        
        //translation = function (x, y) { "translate(" + x + "," + y + ")" };
        
        svg = d3.select("#" + chartId).append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "half-donut");

        chartSpace = svg.append("g")
            .attr("transform", "translate(" + (chartWidth / 2) + "," + ((chartHeight + (chartHeight / 2)) / 2) + ")");
                
        actualSpace = chartSpace.append("g").attr("class", "actuals");
        
        actualSpace.selectAll("path")
            .data(pies(data))
            .enter()
            .append("path")
            .attr("class", "actual")
            .attr("fill", function (d, i) { return colors[i]; })
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", arc);

        rangeSpace = chartSpace.append("g").attr("class", "ranges")
			.attr('aria-hidden', "true");

        rangePosition = (chartWidth - thickness) / 2;

        rangeStart = rangeSpace.append("text")
            .attr("class", "min-range")
            .text(d3.format(",")(dataInfo.gaugeMin))
            .attr("dx", "-" + rangePosition + "px")
            .attr("dy", "1.3em");
        rangeEnd = rangeSpace.append("text")
            .attr("class", "max-range")
            .text(d3.format(",")(dataInfo.gaugeMax))
            .attr("dx", rangePosition + "px")
            .attr("dy", "1.3em");

        if (dataInfo.hasOwnProperty('midTarget')) {
            thicknessTarget = 10;
            dataTarget = [arcMultiplierTargetRed, arcMultiplierTargetYellow, 1 - arcMultiplierTargetRed - arcMultiplierTargetYellow];
            arcTargets.outerRadius(radiusTarget)
                .innerRadius(radiusTarget - thicknessTarget);
            targetSpace = chartSpace.append("g");

            targetSpace.selectAll("path")
                .data(pies(dataTarget))
                .enter()
                .append("path")
                .attr("class", "targets")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("fill", function (d, i) { return arcColorTarget[i]; })
                .attr("d", arcTargets);
        }

        labelSpace = chartSpace.append("g").attr("class", "labels");
        labelItem = labelSpace.append("text")
            .text(function (d) { return d3.format(",")(currentValue); })
            //.attr("dy", "-3rem")
            .attr("class", "label label-actual")
            .attr("text-anchor", "middle");
			
		labelSpace.append("text")
            .text(dataInfo.dataUnits)
            .attr("dy", "1.25em")
            .attr("class", "unit")
            .attr("text-anchor", "middle");

        let labelActualSize = getTextSize(labelItem.node()) * 14;
        labelItem.attr("style", "font-size:" + d3.format('.2f')(labelActualSize) + "px; font-weight: bold");

        /*unitsSpace = chartSpace.append("g").attr("class", "units");
        unitsSpace.append("text")
            .text(dataInfo.dataUnits)
            .attr("dy", "1.25em")
            .attr("class", "unit")
            .attr("text-anchor", "middle");*/

        if (showDate) {
            /*reportingPeriodSpace = chartSpace.append("g").attr("class", "reporting");
            reportingPeriodSpace.append("text")*/
			labelSpace.append("text")
                .text(dataInfo.reportDateText)
                .attr("dy", "3em")
                .attr("class", "report-date")
                .attr("text-anchor", "middle")
				.attr("style", "font-weight: bold");
        }

        window.addEventListener('resize', drawChart);
        drawChart();
    }

    function drawChart() {
        setDimensions();

        svg.attr("width", chartWidth)
            .attr("height", chartHeight);

        chartSpace.attr("transform", translation(chartWidth / 2, (chartHeight + (chartHeight / 2)) / 2));

        arc.innerRadius(radius - thickness)
            .outerRadius(radius);
        
        arc.outerRadius(radius)
            .innerRadius(radius - thickness);
        
        //actualItem.attr("d", arc);

        actualSpace.remove();
        actualSpace = chartSpace.append("g").attr("class", "actuals");

        actualSpace.selectAll("path")
            .data(pies(data))
            .enter()
            .append("path")
            .attr("class", "actual")
            .attr("fill", function (d, i) { return colors[i]; })
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", arc);

        rangePosition = (chartWidth - thickness) / 2;

        rangeStart.attr("dx", "-" + rangePosition + "px");
        rangeEnd.attr("dx", rangePosition + "px");

        if (dataInfo.hasOwnProperty('midTarget')) {
            arcTargets.outerRadius(radiusTarget)
                .innerRadius(radiusTarget - thicknessTarget);
            targetSpace.remove();
            targetSpace = chartSpace.append("g");

            targetSpace.selectAll("path")
                .data(pies(dataTarget))
                .enter()
                .append("path")
                .attr("class", "targets")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("fill", function (d, i) { return arcColorTarget[i]; })
                .attr("d", arcTargets);
        }

        labelSpace.remove();

        labelSpace = chartSpace.append("g").attr("class", "labels");
        labelItem = labelSpace.append("text")
            .text(function (d) { return d3.format(",")(currentValue); })
            //.attr("dy", "-3rem")
            .attr("class", "label label-actual")
            .attr("text-anchor", "middle");

        let labelActualSize = getTextSize(labelItem.node()) * 14;
        labelItem.attr("style", "font-size:" + d3.format('.2f')(labelActualSize) + "px; font-weight: bold");
		
		labelSpace.append("text")
            .text(dataInfo.dataUnits)
            .attr("dy", "1.25em")
            .attr("class", "unit")
            .attr("text-anchor", "middle");
			
		if (showDate) {
			labelSpace.append("text")
                .text(dataInfo.reportDateText)
                .attr("dy", "3em")
                .attr("class", "report-date")
                .attr("text-anchor", "middle")
				.attr("style", "font-weight: bold");
        }
    }

    function getTextSize(textNode) {
        let widthText = chartWidth - (thickness * 2) - (thicknessTarget * 2) - 60, heightText = chartHeight - (thickness * 2) - (thicknessTarget * 2) - 60;
        let bb = textNode.getBBox();
        let widthTransform = widthText / bb.width;
        let heightTransform = heightText / bb.height;
        let textSize = widthTransform < heightTransform ? widthTransform : heightTransform;
        return textSize < 4 ? textSize : 4;
    }

    function setDimensions() {
        svgWidth = document.getElementById(chartId).offsetWidth;
        chartHeight = svgHeight - margin.top - margin.bottom;
        //chartHeight = svgWidth - margin.top - margin.bottom;
        chartWidth = svgWidth - margin.left - margin.right;
        thickness = chartHeight * 0.2;
        widthTarget = chartHeight * 0.65;
        heightTarget = chartHeight * 0.65;
        radius = Math.min(chartWidth, 2 * chartHeight) / 2;
        radiusTarget = Math.min(widthTarget, 2 * heightTarget) / 2;
    }

    chart.dataInfo = function (value) {
        if (!arguments.length) return dataInfo;
        dataInfo = value;
        return chart;
    };

    chart.chartId = function (value) {
        if (!arguments.length) return chartId;
        chartId = value + '-gauge';
        return chart;
    };

    chart.currentValue = function (value) {
        if (!arguments.length) return currentValue;
        currentValue = value;
        return chart;
    };

    chart.svgWidth = function (value) {
        if (!arguments.length) return svgWidth;
        svgWidth = value;
        return chart;
    };

    chart.svgHeight = function (value) {
        if (!arguments.length) return svgHeight;
        svgHeight = value;
        return chart;
    };

    chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.arcColor = function (value) {
        if (!arguments.length) return arcColor;
        arcColor = value;
        return chart;
    };

    chart.showDate = function (value) {
        if (!arguments.length) return showDate;
        showDate = value;
        return chart;
    };

    return chart;
}