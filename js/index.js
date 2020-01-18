var ctx = document.getElementById('myChart');

Chart.defaults.global.defaultFontColor = 'black';
Chart.defaults.global.defaultFontSize = 16;

var data = {

  datasets: [{
      label: "Baseline",
      backgroundColor: 'rgba(255, 0, 0, 1)',
      data: []
    }, {
      label: "Envoy",
      backgroundColor: 'rgba(0, 0, 255, 1)',
      data: [],
    }, {
      label: "Difference",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      data: [],
    }
  ]
};

// Notice the scaleLabel at the same level as Ticks
var options = {
    scales: {
        xAxes: [{
            type: 'linear',
            position: 'bottom',
	    ticks: {
		    beginAtZero: true,
		    fontSize: 14,
		    max: 1.0,
		    min: 0
	    },
	    scalelabel: {
		    display: true,
		    labelString: "Percentile",
		    fontSize: 16
	    }
        }],
        yAxes: [{
            ticks: {
		    beginAtZero: true,
		    fontSize: 14,
		    max: 2.5,
		    min: 0
	    },
	    scalelabel: {
		    display: true,
		    labelString: "Response Time (ms)",
		    fontSize: 16
	    }
        }]
    },
    title: {
    	display: true,
	text: "Response Times vs. Percentile"
    },
    legend: {
	    display: true
    },
    responsive: false
}

const chart = new Chart(ctx, {
	type: 'scatter',
	data: data,
	options: options
})

const configs = [ 
    'add_user_agent', 
    'server_name', 
    'cluster', 
    'forward_client_cert_details', 
    'set_current_client_cert_details', 
    'use_remote_address', 
    'skip_xff_append'
]

const headers = [
    "user-agent", 
    "server", 
    "x-client-trace-id", 
    "x-envoy-downstream-service-cluster", 
    "x-envoy-downstream-service-node", 
    "x-envoy-external-address", 
    "x-envoy-force-trace", 
    "x-envoy-internal"
]

const update_page = () => {

        const header_profile = headers.map(
		header => document.getElementById(header).checked ? "1": "0"
	).join("")

        const config_profile = configs.map(
		config => document.getElementById(config).checked ? "1": "0"
	).join("")

	
	const rate = "100", concurrency = "4", duration = "10"
	const root_url = `http://localhost:8000/${header_profile}/${rate}/${concurrency}/${duration}`
	const flamegraph_url = `${root_url}/${config_profile}/perf.svg`

	get_data_and_draw(root_url, config_profile)

	document.getElementById("flamegraph_envoy").src = flamegraph_url
}

const get_data_and_draw = async (root_url, config_profile) => {
	

	const baseline_vegeta_url = `${root_url}/none/vegeta.bin`
	const envoy_vegeta_url = `${root_url}/${config_profile}/vegeta_success.plot`

	const baseline_data = await fetch(baseline_vegeta_url).then(req => req.json()).then(_ => _["data"])
	const envoy_data = await fetch(envoy_vegeta_url).then(req => req.json()).then(_ => _["data"])
	const difference = envoy_data.map((datapoint, index) => [datapoint[0] - baseline_data[index][0], datapoint[1]])
	console.log(difference)
	console.log(envoy_data)

	draw(baseline_data, 0)
	draw(envoy_data, 1)
	draw(difference, 2)

}

const draw = (series, label_index) => { 
	chart.data.datasets[label_index].data = series.map(point => ({x: point[1], y: point[0]}))
	chart.update()
}

// get all the checkboxes on the page
const checkboxes = [...document.querySelectorAll('input[type=checkbox]')];
checkboxes.map(
	checkbox => checkbox.addEventListener('change', update_page)
)
