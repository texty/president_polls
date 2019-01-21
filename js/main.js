(function() {
    var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko","Lyashko"];
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko"];
    // var candidates = ["Tymoshenko","Poroshenko"];
    var candidates = ["Tymoshenko","Poroshenko","Grytsenko"];

    d3.queue()
        .defer(d3.csv, "data/chart_data_lines.csv")
        .defer(d3.csv, "data/chart_data_points.csv")
        .await(function(err, raw_data_lines, raw_data_points) {

            raw_data_lines.forEach(function(d) {
                d.median = + d.median;
                d.lower = + d.lower;
                d.upper = + d.upper;
                d.date = new Date(d.date);
                delete d[""];
            });

            raw_data_points.forEach(function(d) {
                d.date = new Date(d.end_date);
                candidates.forEach(function(candidate) {d[candidate] = toNumber(d[candidate])});
                delete d[""];
            });

            var points_data_long = [];

            candidates.forEach(function(candidate){
               Array.prototype.push.apply(points_data_long, raw_data_points.map(d => ({
                   date: d.date,
                   candidate: candidate,
                   v: d[candidate],
                   poll_house: d.poll_house
               })).filter(obj => obj.v != null))
            });


            var points_data = d3.nest()
                .key(d => d.candidate)
                .entries(points_data_long);

            var polls = d3.nest()
                .key(d => d.poll_house + "---" + d.date)
                .entries(points_data_long)

            polls.forEach(function(d) {
                    d.date = d.values[0].date;
                    d.poll_house = d.values[0].poll_house
                });


            console.log(points_data);

            var lines_data = d3.nest()
                .key(d => d.candidate)
                .entries(raw_data_lines)
                .filter(obj => candidates.includes(obj.key));

            console.log(raw_data_lines);
            console.log(lines_data);

            console.log(polls)

            var main_chart = poll_chart()
                .x_domain(d3.extent(raw_data_lines, d => d.date))
                .y_domain([3,18])
                .xTicks(polls);



            lines_data.forEach(function(line, i) {
                // if (i < 2) {
                    main_chart.addAreaLine({
                        data: line.values.map(d => ({date: d.date, v: d.median, v0: d.lower, v1: d.upper})),
                        "class": "candidate_" + i + " " + line.key
                    })
                // } else {
                    main_chart.addLine({
                        data: line.values.map(d => ({date: d.date, v: d.median, v0: d.lower, v1: d.upper})),
                        "class": "candidate_" + i + " " + line.key
                    })


                // }
            });

            points_data.forEach(function(candidate_obj, i) {
                main_chart.addPoints({
                    data: candidate_obj.values,
                    "class": "candidate_" + i + " " + candidate_obj.key
                })
            });


            d3.select("#main_chart").call(main_chart);

            
            
            




            var main_chart2 = poll_chart()
                .x_domain(d3.extent(raw_data_lines, d => d.date))
                .y_domain([3,18])


            points_data.forEach(function(candidate_obj, i) {
                main_chart2.addPoints({
                    data: candidate_obj.values,
                    "class": "candidate_" + i + " " + candidate_obj.key
                })
            });


            lines_data.forEach(function(line, i) {
                main_chart2.addAreaLine({
                    data: line.values.map(d => ({date: d.date, v: d.median, v0: d.lower, v1: d.upper})),
                    "class": "candidate_" + i + " " + line.key
                })
            });

            d3.select("#main_chart2").call(main_chart);


        });

    function toNumber(str) {
        if (!str || !str.length || str == "NA") return null;
        return +str;
    }
})();


