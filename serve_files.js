const fs = require('fs')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

const parse_vegeta_file = filename => {

	file_contents = fs.readFileSync(filename).toString()
	newline_separated_contents = file_contents.split('\n')
	
	parsed_row = row => row.split(' ').filter(_ => _ !== "" ).slice(0,2)

	// returns an array of 2-length arrays. Each 2-length array contains response time in ms
	// at index 0, and percentile of that response at index 1. Think of this as (x, y) pairs.
	// We drop the headers and the last row (which is always an empty line).
	//
	return newline_separated_contents.map(parsed_row).slice(1, -1).filter(item => parseFloat(item[1]) < 0.98)

}

const parse_request_duration_file = filename => {

	file_contents = fs.readFileSync(filename).toString()
	newline_separated_contents = file_contents.split('\n')

	// this takes a file with two comma-separated elements, and computes the numerical difference between the elements
	parsed_row = row => row.split(',').reduce((start, end) => parseInt(start, 10) - parseInt(end, 10))

	// returns an array of 2-length arrays. Each 2-length array contains response time in ms
	// at index 0, and percentile of that response at index 1. Think of this as (x, y) pairs. 
	// To do this correctly, I need to manually compute the percentile value, which should be easy
	// with just indices.
	sorted_array = newline_separated_contents.slice(1).map(parsed_row).sort((a, b) => a - b)

	length = sorted_array.length()
	return sorted_array.map((response_time, index) => [response_time, index / length])

}

app.get('/:headers/:rate/:concurrency/:duration/:configs/:file', function (req, res) {
  	const filename = `results/${req.params.headers}/${req.params.rate}/${req.params.concurrency}/${req.params.duration}/${req.params.configs}/${req.params.file}`

  	if (req.params.file === "vegeta_success.plot" || req.params.file === "vegeta.bin" ) {
      		series_data = parse_vegeta_file(filename)
      		res.json({data: series_data})
	} else if (req.params.file === "request_duration.csv") {
      		series_data = parse_request_duration_file(filename)
      		res.json({data: series_data})
  	} else if (req.params.file === "perf.svg") {
		res.sendFile(filename, {root: __dirname});
	} else {
     		res.json({data: 'File Not Found'})
  	}
})

app.listen(8000)
