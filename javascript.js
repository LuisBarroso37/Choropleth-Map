let url1 = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

let url2 = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

Promise.all([
            fetch(url1).then(res => res.json()),
            fetch(url2).then(res => res.json())
            ])
.then(data => {
  let topography = data[0];
  let education = data[1];
 
  let path = d3.geoPath();
  
  const colors = [
    "#bef4be",
    "#90EE90",
    "#7CFC00",
    "#00FF00",
    "#32CD32",
    "#228B22",
    "#006400",
    "#001800"
  ];
  
  //function that compares the id from the education json to the id from the counties topography json. The id for the topography json is fips.
  const getEducationValue = countyId => {
    let returnValue = null;
    
    education.forEach(value => {
      if (value.fips == countyId) {
        returnValue = value;
      }
    });
    return returnValue;
  };
  
  const w = 1000;
  const h = 700;
  const padding = 70;
  const minEd = d3.min(education, d => d.bachelorsOrHigher);
  const maxEd = d3.max(education, d => d.bachelorsOrHigher);
  
  //SVG canvas
  const svg = d3.select('#chart')
                .append('svg')
                .attr('width', w)
                .attr('height', h);
  
  //Tooltip
  const tooltip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip");
  
  //Rect - legend
  const g = svg.append("g")
               .attr("id", "legend");
  
  g.selectAll('rect')
     .data(colors)
     .enter()
     .append('rect')
     .attr('x', (d, i) => i * 38.8 + 70)
     .attr('y', d => h - padding + 20)
     .attr('width', 38.8)
     .attr('height', 30)
     .style('fill', d => d);
  
  //Topography map drawing
  svg.append("g")
     .selectAll("path")
     .data(
          topojson.feature(topography, topography.objects.counties)
            .features
     )
     .enter()
     .append("path")
     .attr('d', path)
     .attr("fill", d => {
       if(d == undefined) {
        return 0;
       }
       let edValue = getEducationValue(d.id);
       let percentage = edValue.bachelorsOrHigher;
      
         if (percentage >= 66) {
           return colors[7];
         } else if (percentage >= 57) {
           return colors[6];
         } else if (percentage >= 48) {
           return colors[5];
         } else if (percentage >= 39) {
           return colors[4];
         } else if (percentage >= 30) {
           return colors[3];
         } else if (percentage >= 21) {
           return colors[2];
         } else if (percentage >= 12) {
           return colors[1];
         } else if (percentage >= 3) {
           return colors[0];
         } else {
           return 'white';
         }
    })
    .attr("class", "county")
    .attr("data-fips", d => {
      if(d == undefined) {
        return 0;
      }
      let ed = getEducationValue(d.id);
      
      return ed.fips;
    })
    .attr("data-education", d => {
      if(d == undefined) {
        return 0;
      }
      let ed = getEducationValue(d.id);
      
      return ed.bachelorsOrHigher;
    })
    .on('mouseover', d => {
       if(d == undefined) {
         return 0;
       }
       let ed = getEducationValue(d.id);
    
       tooltip.style("left", d3.event.pageX + 20 + "px")
              .style("top", d3.event.pageY - 30 + "px")
              .style("display", "inline-block")
              .style('opacity', 1)
             .html(`${ed.state} - ${ed.area_name}<br>Education level: ${ed.bachelorsOrHigher} %`)
              .attr('data-education', ed.bachelorsOrHigher);
     })
     .on('mouseout', d => {
       tooltip.style('opacity', 0)
              .style('display', 'none');
     });
  
  //Scale - legend
  const legendScale = d3.scaleLinear().domain([3, 66])
  .range([0, 270]);
  
  //Axis - legend
  const legendAxis = d3.axisBottom(legendScale)
.tickValues([3, 12, 21, 30, 39, 48, 57, 66])
.tickFormat(x  => Math.round(x) + '%');
  
  //Axis label - legend
  g.append('g')
     .attr('transform', `translate(${padding}, ${(h - padding + 50)})`)
     .attr('id', 'legend-axis')
     .call(legendAxis);
});