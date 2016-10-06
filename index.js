var express = require('express')
var app = express()
var http = require('http')

var services = {
	'service_name': 'http://localhost:4000/stats;csv;norefresh'
}

app.use((_, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

app.get('/', function (req, res) {
	res.json(Object.keys(services).reduce((memo, name) => {
		memo[name] = `/${name}`
		return memo
	}, {}))
})

Object.keys(services).forEach(serviceName => {
	app.get(`/${serviceName}`, function (req, res) {
		serviceUrl = services[serviceName]
		http.get(serviceUrl, response => {
			response.on('data', csv => {
				data = csv.toString().match(new RegExp(`^${serviceName},.+$`, 'm'))
				if (!data || !data.length) return res.sendStatus(500)
				const isUp = data[0].split(',')[17] === "UP"
				res.json(isUp)
			})

			response.on('error', e => console.log(e))
		}).on('error', e => console.log(e))
	})
})

app.listen(3000, function () {
	console.log('Listening on 3000')
})
