function barChart() {
    let dataInfo,
        chartId,
        chartData,
        series,
        showBarLabel = false,
        positionBarLabel = "baseline",
        showLegend = false,
        margin = { top: 40, right: 30, bottom: 40, left: 30 },
        svgWidth,
        svgHeight = 400,
        inModal = false,
        chartHeight,
        chartWidth,
        chartSpace,
        gridlines,
        colorScheme,
        y0 = 0,
        x0 = d3.scaleBand(),
        x1 = d3.scaleBand(),
        y = d3.scaleLinear(),
        xAxis,
        xAxisElement,
        yAxis,
        yAxisElement,
        svg,
        maxTickWidth = 0,
        barSpace,
        bars,
        barLabelSpace,
        barLabels,
        tip,
        groupKey,
        keys,
        flipAxis = false,
        flipLabelX = false,
        xAxisTickFit = false,
        xAxisHideTick = false,
        grouped = false,
        stacked = false,
        reverseKeys = false,
        colorByBar = false,
        colorByRating = false,
        xTimeRange = true,
        xAxisClass = 'axis axis-x axis-bottom',
        yAxisClass = 'axis axis-y axis-left',
        xAxisLabel = "",
        xAxisLabelMargin = 0,
        yAxisLabel = "",
        yAxisLabelMargin = 0,
        gridLinesSpace,
        gridLinesX = false,
        gridLinesY = false,
        makeDataTable = true,
        isPercent = false;
    
    function chart(selection) {
        if (makeDataTable) {
            generateDataTable(chartId, chartData);
        }

        setDimensions();
        
        if (flipAxis) {
            xAxis = d3.axisLeft().scale(x0);
            yAxis = d3.axisBottom().scale(y);
            xAxisClass = 'axis axis-x axis-left';
            yAxisClass = 'axis axis-y axis-bottom';
        } else {
            xAxis = d3.axisBottom().scale(x0);
            yAxis = d3.axisLeft().scale(y);
        }

        tip = d3.tip().attr('class', 'd3-tip').html(function (event, d, i) {
            if (grouped) {
                if (isPercent) {
                    return d.groupKey + " " + d.key + ": " + d3.format(',')(d.value) + "%";
                }
                
                return d.groupKey + " " + d.key + ": " + d3.format(',')(d.value);
            }

            if (isPercent) {
             return d.groupKey + ": " + d3.format(',')(d.value) + "%";
            }

            return d.groupKey + ": " + d3.format(',')(d.value);
        }).offset([-8, 0]);
        
        groupKey = chartData.columns[0];
        keys = chartData.columns.slice(1);

        if (stacked) {
            x0.domain(chartData.map(function (d) { return d[groupKey] }))
                .padding(0.2);
        } else {
            x0.domain(chartData.map(function (d) { return d[groupKey] }))
                .paddingInner(0.08);
        }

        x1.domain(keys)
            .padding(0.2);

        if (dataInfo.hasOwnProperty('tickMin') && dataInfo.hasOwnProperty('tickMax')) {
            y.domain([dataInfo.tickMin, dataInfo.tickMax]);
            y0 = dataInfo.tickMin;
        } else {
            y.domain([0, d3.max(chartData, function (d) { return d3.max(keys, function (key) { return +d[key] }) })]).nice();
        }

        svg = d3.select('#' + chartId)
            .append("svg")
            .attr('width', chartWidth)
            .attr('height', chartHeight)
			.attr('aria-labelledby', chartId + '-data-table');

        chartSpace = svg.append("g")
			.attr('aria-hidden', "true");
        
        if (dataInfo.hasOwnProperty('tickMin') && dataInfo.hasOwnProperty('tickMax') && dataInfo.hasOwnProperty('tickInterval')) {
            let tickArray = [];
            let tickCount = (dataInfo.tickMax - dataInfo.tickMin) / dataInfo.tickInterval;
            for (let i = 0; i <= tickCount; i++) {
                let currentInterval = dataInfo.tickInterval * i;
                tickArray.push(+formatStringToNumber(d3.format(',')(dataInfo.tickMin + currentInterval)));
            }
            yAxis.tickValues(tickArray).tickFormat(d3.format(','));
        }
        
        if (!flipAxis) {
            chartSpace.selectAll("text.foo").data(y.ticks())
                .enter().append("text").text(function (d) { return y.tickFormat()(d); })
                .each(function (d) {
                    maxTickWidth = Math.max(this.getBBox().width + yAxis.tickSize() + yAxis.tickPadding(), maxTickWidth);
                })
                .remove();
        }

        if (yAxisLabel !== "") {
            yAxisLabelMargin = 20;
        }
                
        chartSpace.attr("transform", "translate(" + (Math.max(margin.left, maxTickWidth) + yAxisLabelMargin) + "," + margin.top + ")");

        gridLinesSpace = chartSpace.append("g")
            .attr("class", "grid");
        
        yAxisElement = chartSpace.append("g")
            .attr("class", yAxisClass)
			.attr('aria-hidden', "true");

        // add the x Axis
        xAxisElement = chartSpace.append("g")
            .attr("class", xAxisClass);
        
        if (stacked) {
            tip = d3.tip().attr('class', 'd3-tip').html(function (event, d) {
                return d3.format(",")((Math.round(((d[1] - d[0])) * 100) / 100)) + " " + dataInfo.dataUnits;
            }).offset([-8, 0]);
            if (reverseKeys) {
                keys = keys.reverse();
            }
            series = d3.stack().keys(keys)(chartData);

            barSpace = chartSpace.append("g")
                .attr("class", "bar-space")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", function (d) { return colorByRating ? colorScheme(d.value) : colorScheme[d.index]; });

            bars = barSpace.selectAll("rect")
                .data(function (d) { return d; })
                .join("rect")
                .attr("class", "has-tip")
                .on('mouseover', function (event, d) { const e = bars.nodes(); const i = e.indexOf(this); tip.show(event, d, i); })
                .on('mouseout', tip.hide);

            if (showBarLabel) {
                barLabelSpace = chartSpace.append("g")
                    .attr("class", "bar-labels")
                    .selectAll("g")
                    .data(series)
                    .join("g");
                    //.attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });

                barLabels = barLabelSpace.selectAll("text")
                    .data(function (d, i) {
                        //console.log(i);
                        /*console.log(Math.round(((d[0][1] - d[0][0]) + Number.EPSILON) * 100) / 100);
                        return keys.map(function (key) {
                            return {
                                key: key, value: d[key]
                            };
                        });*/
                        return d;
                    })
                    .join("text")
                    .attr("fill", function (d) {
                        //getContrastColor(hexToRgb(colorScheme[i])) })
                        return "#000";
                    })
                    .text(function (d) { 
                        if ((Math.round((d[1] - d[0]) * 100) / 100) > 0) { 
                            if(isPercent) {
                                return d3.format(",")((Math.round(((d[1] - d[0])) * 100) / 100)) + "%";
                            }

                            return d3.format(",")((Math.round(((d[1] - d[0])) * 100) / 100));
                        } 
                    });

                if (positionBarLabel === "top") {
                    barLabels.attr("y", function (d) { return y(d.value) }).attr("fill", "#000");
                }
            }
        } else {
            barSpace = chartSpace.append("g")
                .attr("class", "bar-space")
                .selectAll("g")
                .data(chartData)
                .join("g")
                .attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });

            bars = barSpace.selectAll("rect")
                .data(function (d, j) {
                    return keys.map(function (key) {
                        return {
                            key: key, value: d[key], groupKey: d[groupKey], parentI: j
                        };
                    });
                })
                .join("rect")
                .attr("class", "has-tip")
                .attr("fill", function (d, i) {
                    return colorByRating ? colorScheme(d.value) : colorByBar ? colorScheme[d.parentI] : colorScheme[i];
                })
                .on('mouseover', function (event, d) { const e = bars.nodes(); const i = e.indexOf(this); tip.show(event, d, i); })
                .on('mouseout', tip.hide);

            if (showBarLabel) {
                barLabelSpace = chartSpace.append("g")
                    .attr("class", "bar-labels")
                    .selectAll("g")
                    .data(chartData)
                    .join("g")
                    .attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });

                barLabels = barLabelSpace.selectAll("text")
                    .data(function (d, j) {
                        return keys.map(function (key) {
                            return {
                                key: key, value: d[key], parentI: j
                            };
                        });
                    })
                    .join("text")
                    .attr("x", function (d) { return x1(d.key) })
                    .attr("y", function (d) { return y(y0) })
                    .attr("dx", function (d) { return x1.bandwidth() / 2 })
                    .attr("dy", "-0.71em")
                    .attr("text-anchor", "middle")
                    .attr("width", x1.bandwidth())
                    .attr("fill", function (d, i) {
                        //return getContrastColor(colorScheme(d.value));
                        return getContrastColor(colorByRating ? colorScheme(d.value) : colorByBar ? colorScheme[d.parentI] : colorScheme[i]);
                        //return "#fff";
                    })
                    .text(function (d) { 
                        if(isPercent) {
                            return d3.format(",")(d.value) + "%"; 
                        }
                        return d3.format(",")(d.value); 
                    });

                if (positionBarLabel === "top") {
                    barLabels.attr("y", function (d) { return y(d.value) }).attr("fill", "#000");
                }
            }
        }

        if (showLegend) {
            let legend = d3.select('#' + chartId + '-legend').attr('aria-hidden', "true");
            if (stacked && reverseKeys) {
                keys = keys.reverse();
                colorScheme = colorScheme.reverse();
            }

            let keysLegend = legend.selectAll('.key')
                .data(keys)
                .enter().append('div')
                .attr('class', 'key');

            /*keysLegend.append('div')
                .attr('class', 'symbol')
                .style('background-color', function (d, i) { return colorScheme[i]; });*/

            keysLegend.append('div')
                .attr('class', 'symbol')
                .append('svg')
                .attr('class', 'legend-symbol')
                .append('g')
                .append('rect')
                .attr("width", 10).attr("height", 10)
                .attr('fill', function (d, i) { return colorScheme[i]; });

            keysLegend.append('div')
                .attr('class', 'name')
                .text(function (d, i) { return d; });

            keysLegend.exit().remove();
        }

        if (xAxisLabel !== "") {
            xAxisLabelMargin = 23; //minimum for standard x-axis
            if (flipLabelX) {
                xAxisLabelMargin = 50;
                if (!xTimeRange) {
                    xAxisLabelMargin = 20;
                }
            }
            if (flipAxis) {
                xAxisLabelMargin = 18;
            }

            if (xAxisHideTick) {
                xAxisLabelMargin = 12;
            }

            chartSpace.append("text")
                .attr("id", "axis-label-x")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (chartWidth / 2) + "," + (chartHeight + xAxisLabelMargin) + ")")  // centre below axis
                .text(xAxisLabel);
        }

        if (yAxisLabel !== "") {
            chartSpace.append("text")
                .attr("id", "axis-label-y")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(-" + (Math.max(margin.left, maxTickWidth) + (yAxisLabelMargin / 2)) + "," + (chartHeight / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text(yAxisLabel);
        }

        chartSpace.call(tip);

        drawChart();

        window.addEventListener('resize', drawChart);
    }

    function drawChart() {
        setDimensions();
        svg.attr('width', svgWidth)
            .attr('height', svgHeight);
                
        if (flipAxis) {
            x0.rangeRound([0, chartHeight]);
            y.rangeRound([0, chartWidth]);
        } else {
            x0.rangeRound([0, chartWidth]);
            y.rangeRound([chartHeight, 0]);
        }

        x1.rangeRound([0, x0.bandwidth()]);
        xAxis.scale(x0);
        
        if (xAxisTickFit) {
            xAxisElement.attr("transform", "translate(0," + (chartHeight) + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");
        } else {
            if (xAxisHideTick) {
                xAxis.tickValues([]);
            }

            xAxisElement.attr("transform", flipAxis ? "" : "translate(0," + (chartHeight) + ")")
                .call(xAxis);
        }

        if (!flipAxis && !flipLabelX) {
            xAxisElement.selectAll(".tick text")
                .call(wrap, x0.bandwidth())
                .call(function (g) { g.select(".domain").remove() });
        }

        if (flipLabelX) {
            xAxisElement.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "-.3em")
                .attr("transform", "rotate(-90)");
        }

        if (xAxisLabel !== "") {
            //chartSpace.select("#axis-label-x").call(wrap, chartWidth);
        }

        yAxis.scale(y);

        yAxisElement.attr("transform", flipAxis ? "translate(0," + (chartHeight) + ")" : "").call(yAxis);


        if (stacked) {
            bars.attr("x", function (d) { return x0(d.data.Date) })
                .attr("y", function (d) { return y(d[1]) })
                .attr("height", function (d) { return y(d[0]) - y(d[1]) })
                .attr("width", x0.bandwidth());
            /*bars.attr("x", function (d) { console.log(d);return flipAxis ? 1 : x1(d.key) })
                .attr("y", function (d) { return flipAxis ? x1(d.key) : y(d.value) })
                .attr("width", function (d) { return flipAxis ? y(d.value) - y(y0) : x1.bandwidth() })
                .attr("height", function (d) { return flipAxis ? x1.bandwidth() : y(y0) - y(d.value) });*/
            if (showBarLabel) {
                /*barLabelSpace
                    .attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });*/

                barLabels.attr("x", function (d) { return x0(d.data.Date) })
                    .attr("y", function (d) { return y(d[0]) - 4 })
                    .attr("dx", function (d) { return x0.bandwidth() / 2 })
                    .attr("width", x0.bandwidth())
                    .attr("text-anchor", "middle");

                if (positionBarLabel === "top") {
                    barLabels.attr("y", function (d) { return y(d.value) });
                }
            }
        }
        else {
            barSpace.attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });

            bars.attr("x", function (d) { return flipAxis ? 1 : x1(d.key) })
                .attr("y", function (d) { return flipAxis ? x1(d.key) : y(d.value) })
                .attr("width", function (d) {
                    let barWidth = 0;
                    if (flipAxis) {
                        barWidth = y(d.value) - y(y0);
                    }
                    else {
                        barWidth = x1.bandwidth();
                    }
                    return barWidth >= 0 ? barWidth : 0;
                })
                .attr("height", function (d) {
                    let barHeight = 0;
                    if (flipAxis) {
                        barHeight = x1.bandwidth();
                    }
                    else {
                        barHeight = y(y0) - y(d.value);
                    }
                    return barHeight >= 0 ? barHeight : 0;

                    //return flipAxis ? x1.bandwidth() : y(y0) - y(d.value)
                });

            if (showBarLabel) {
                barLabelSpace
                    .attr("transform", function (d) { return flipAxis ? 'translate(0,' + x0(d[groupKey]) + ')' : 'translate(' + x0(d[groupKey]) + ',0)'; });

                barLabels.attr("x", function (d) { return x1(d.key) })
                    .attr("y", function (d) { return y(y0) })
                    .attr("dx", function (d) { return x1.bandwidth() / 2 })
                    .attr("width", x1.bandwidth());

                if (positionBarLabel === "top") {
                    barLabels.attr("y", function (d) { return y(d.value) });
                }
            }
        }
        
        if (gridLinesX || gridLinesY) {
            if (gridLinesY && !flipAxis) {
                gridlines = d3.axisLeft()
                    .tickFormat("")
                    .tickSize(-chartWidth)
                    .scale(y);
            }

            if (gridLinesY && flipAxis) {
                gridlines = d3.axisBottom()
                    .tickFormat("")
                    .tickSize(-chartHeight)
                    .scale(y);
                gridLinesSpace.attr("transform", "translate(0," + (chartHeight) + ")");
            }

            gridLinesSpace.call(gridlines);
        }
    }
    
    function setDimensions() {
        if (!inModal) {
            svgWidth = document.getElementById(chartId).offsetWidth;
        }
        else {
            if (window.innerWidth >= 768) {
                svgWidth = 500;
            } else {
                svgWidth = window.innerWidth - 40;
            }
        }

        chartHeight = svgHeight - margin.top - margin.bottom - xAxisLabelMargin;
        chartWidth = svgWidth - margin.left - margin.right - yAxisLabelMargin;
    }
    
    chart.dataInfo = function (value) {
        if (!arguments.length) return dataInfo;
        dataInfo = value;
        return chart;
    };

    chart.chartId = function (value) {
        if (!arguments.length) return chartId;
        chartId = value + '-bar';
        return chart;
    };

    chart.chartData = function (value) {
        if (!arguments.length) return chartData;
        chartData = value;
        return chart;
    };

    chart.showBarLabel = function (value) {
        if (!arguments.length) return showBarLabel;
        showBarLabel = value;
        return chart;
    };

    chart.positionBarLabel = function (value) {
        if (!arguments.length) return positionBarLabel;
        positionBarLabel = value;
        return chart;
    };

    chart.showLegend = function (value) {
        if (!arguments.length) return showLegend;
        showLegend = value;
        return chart;
    };

    chart.grouped = function (value) {
        if (!arguments.length) return grouped;
        grouped = value;
        return chart;
    };

    chart.stacked = function (value) {
        if (!arguments.length) return stacked;
        stacked = value;
        return chart;
    };

    chart.reverseKeys = function (value) {
        if (!arguments.length) return reverseKeys;
        reverseKeys = value;
        return chart;
    };

    chart.colorByBar = function (value) {
        if (!arguments.length) return colorByBar;
        colorByBar = value;
        return chart;
    };

    chart.colorByRating = function (value) {
        if (!arguments.length) return colorByRating;
        colorByRating = value;
        return chart;
    };

    chart.flipAxis = function (value) {
        if (!arguments.length) return flipAxis;
        flipAxis = value;
        return chart;
    };

    chart.flipLabelX = function (value) {
        if (!arguments.length) return flipLabelX;
        flipLabelX = value;
        return chart;
    };

    chart.xAxisTickFit = function (value) {
        if (!arguments.length) return xAxisTickFit;
        xAxisTickFit = value;
        return chart;
    };

    chart.xAxisHideTick = function (value) {
        if (!arguments.length) return xAxisHideTick;
        xAxisHideTick = value;
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

    chart.colorScheme = function (value) {
        if (!arguments.length) return colorScheme;
        colorScheme = value;
        return chart;
    };

    chart.inModal = function (value) {
        if (!arguments.length) return inModal;
        inModal = value;
        return chart;
    };

    chart.xTimeRange = function (value) {
        if (!arguments.length) return xTimeRange;
        xTimeRange = value;
        return chart;
    };

    chart.xAxisLabel = function (value) {
        if (!arguments.length) return xAxisLabel;
        xAxisLabel = value;
        return chart;
    };

    chart.yAxisLabel = function (value) {
        if (!arguments.length) return yAxisLabel;
        yAxisLabel = value;
        return chart;
    };

    chart.gridLinesX = function (value) {
        if (!arguments.length) return gridLinesX;
        gridLinesX = value;
        return chart;
    };

    chart.gridLinesY = function (value) {
        if (!arguments.length) return gridLinesY;
        gridLinesY = value;
        return chart;
    };

    chart.makeDataTable = function (value) {
        if (!arguments.length) return makeDataTable;
        makeDataTable = value;
        return chart;
    };

    chart.isPercent = function (value) {
        if (!arguments.length) return isPercent;
        isPercent = value;
        return chart;
    };
    
    return chart;
}
