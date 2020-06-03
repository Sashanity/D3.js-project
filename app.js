// set the svg
let svg = d3.select("svg"),
    margin = { top: 80, right: 10, bottom: 80, left: 25 },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// colors for the bar chart
let colors = d3.scaleOrdinal()
    .range(["#354B5F", "#218f7b", "#99c7bb"]);


// get the data from csv and build thhe graph
d3.csv("data/datasets_596958_1073629_Placement_Data_Full_Class.csv")
    .then(function (data) {
        // build a table with the columns of interest
        let columns = ["sl_no", "degree_p", "workex", "status"]
        tabulate(data, columns)

        let totalGraguates_1 = 0, totalGraguates_2 = 0, totalGraguates_3 = 0, totalGraguates_4 = 0, totalGraguates_5 = 0;
        let placed_1 = 0, placed_2 = 0, placed_3 = 0, placed_4 = 0, placed_5 = 0;
        let workex_1 = 0, workex_2 = 0, workex_3 = 0, workex_4 = 0, workex_5 = 0;

        // format the data, turns to integer
        data.forEach(function (d) {
            d.degree_p = +d.degree_p;

            // calculate number of student in this rage of degree percent
            if (d.degree_p >= 50 && d.degree_p < 60) {
                totalGraguates_1++;
                if (d.status == "Placed")
                    placed_1++;
                if (d.workex == "Yes")
                    workex_1++;
            }
            if (d.degree_p >= 60 && d.degree_p < 70) {
                totalGraguates_2++;
                if (d.status == "Placed")
                    placed_2++;
                if (d.workex == "Yes")
                    workex_2++;
            }
            if (d.degree_p >= 70 && d.degree_p < 80) {
                totalGraguates_3++;
                if (d.status == "Placed")
                    placed_3++;
                if (d.workex == "Yes")
                    workex_3++;
            }
            if (d.degree_p >= 80 && d.degree_p < 90) {
                totalGraguates_4++;
                if (d.status == "Placed")
                    placed_4++;
                if (d.workex == "Yes")
                    workex_4++;
            }
            if (d.degree_p >= 90) {
                totalGraguates_5++;
                if (d.status == "Placed")
                    placed_5++;
                if (d.workex == "Yes")
                    workex_5++;
            }
        });

        let NEW_DATASET = [
            { Category: "50-60", totalGraguates: totalGraguates_1, placed: placed_1, workex: workex_1 },
            { Category: "60-70", totalGraguates: totalGraguates_2, placed: placed_2, workex: workex_2 },
            { Category: "70-80", totalGraguates: totalGraguates_3, placed: placed_3, workex: workex_3 },
            { Category: "80-90", totalGraguates: totalGraguates_4, placed: placed_4, workex: workex_4 },
            { Category: "90>", totalGraguates: totalGraguates_5, placed: placed_5, workex: workex_5 }
        ]

        let max_a = (NEW_DATASET.map(a => a.totalGraguates))
        let max = Math.max(...max_a)

        let y = d3.scaleLinear()
            .domain([0, max + 10])
            .range([height, 0]);
        const yAxis = d3.axisLeft(y).ticks(7);

        let subgroups = Object.keys(NEW_DATASET[0]).slice(1);
        let x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1)
            .paddingOuter(0.1);
        x0.domain(NEW_DATASET.map(d => d.Category));

        let x1 = d3.scaleBand()
            .paddingOuter(0.25)
            .paddingInner(0.15);
        x1.domain(subgroups).rangeRound([0, x0.bandwidth()])

        // add label for x axis
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .text("Degree Percent")

        // add label for y axis
        svg.append("text")
            .attr("transform",
                "translate(" + (margin.right + 40) + " ," +
                (margin.top - 2) + ")")
            .style("text-anchor", "middle")
            .text("# of Students")


        // Add bar chart
        let sector = g.selectAll("g")
            .data(NEW_DATASET)
            .enter().append("g")
            .attr("transform", d => "translate(" + x0(d.Category) + ",0)")
        sector.selectAll("rect")
            .data(d => subgroups.map(function (key) { return { key: key, value: d[key] }; }))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("width", x1.bandwidth())
            .attr("y", d => y(0))
            .attr("height", 0)
            .attr("fill", d => colors(d.key))

        sector.selectAll("rect")
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value));

        sector.selectAll("text")
            .data(d => subgroups.map(function (key) { return { key: key, value: d[key] }; }))
            .enter().append("text")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value) - 10)
            .style("fill", d => colors(d.key))
            .style("font-size", "1.25em")
            .text(d => d.value)

        //add the x-axis
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0))
            .selectAll(".tick text")
            .call(wrap, x0.bandwidth());

        //add the y-axis 
        g.append("g")
            .call(yAxis)

        g.append("line")
            .attr("y1", y(0))
            .attr("y2", y(0))
            .attr("x1", 0)
            .attr("x2", width)
            .attr("stroke", "black")

        // add legend
        let legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups)
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 24 + ")"; });
        legend.append("rect")
            .attr("x", width - 142)
            .attr("width", 8)
            .attr("height", 8)
            .attr("fill", colors);
        legend.append("text")
            .attr("x", d => d.length > 7 ? (width + 5) : (width - 80))
            .attr("y", 5.5)
            .attr("dy", "0.22em")
            .text(d => (d));
    });

//https://bl.ocks.org/mbostock/7555321 
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
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

let tabulate = function (data, columns) {
    let table = d3.select("table")
    let thead = table.append("thead")
    let tbody = table.append("tbody")

    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (d) { return d })

    let rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")

    rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append("td")
        .text(function (d) { return d.value })

    return table;
}
