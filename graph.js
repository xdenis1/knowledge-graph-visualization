// Knowledge Graph Data
const graphData = {
    "entities": [
        {"name": "Memory Server", "type": "Server", "description": "Handles knowledge graph operations", "group": 1},
        {"name": "Brave Search Server", "type": "Server", "description": "Provides web and local search capabilities", "group": 2},
        {"name": "GitHub Server", "type": "Server", "description": "Supports GitHub repository management", "group": 3},
        {"name": "Filesystem Server", "type": "Server", "description": "Manages file and directory operations", "group": 4},
        {"name": "Google Maps Server", "type": "Server", "description": "Provides geolocation and mapping services", "group": 5}
    ],
    "relations": [
        {"source": "Memory Server", "target": "add_observations", "type": "provides"},
        {"source": "Memory Server", "target": "create_entities", "type": "provides"},
        {"source": "Brave Search Server", "target": "brave_web_search", "type": "provides"},
        {"source": "GitHub Server", "target": "create_repository", "type": "provides"},
        {"source": "Filesystem Server", "target": "read_file", "type": "provides"},
        {"source": "Google Maps Server", "target": "maps_directions", "type": "provides"}
    ]
};

// SVG Setup
const svg = d3.select("#graph");
const width = +svg.style("width").replace('px', '');
const height = +svg.style("height").replace('px', '');

// Color Scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Simulation Setup
const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.name).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(30));

// Prepare Nodes and Links
const nodes = [...graphData.entities, ...graphData.relations.map(r => ({name: r.target, group: 0}))];
const links = graphData.relations.map(r => ({
    source: r.source, 
    target: r.target
}));

// Create Links
const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

// Create Nodes
const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// Add Circles to Nodes
node.append("circle")
    .attr("r", 15)
    .attr("fill", d => color(d.group || 0));

// Add Labels to Nodes
node.append("text")
    .text(d => d.name)
    .attr("x", 15)
    .attr("y", 4);

// Tooltip Interaction
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

node.on("mouseover", function(event, d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(`
        <strong>${d.name}</strong><br>
        ${d.description || 'No additional details'}
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
});

// Simulation Ticks
simulation
    .nodes(nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(links);

function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`)
}

// Drag Functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}