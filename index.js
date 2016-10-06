var express = require('express')
var app = express()
var http = require('http')
var services = require('./services.json')

app.use((_, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

app.get('/', function (req, res) {
	res.json(Object.keys(services))
})

Object.keys(services).forEach(serviceName => {
	app.get(`/${serviceName}`, function (req, res) {
		serviceUrl = services[serviceName]
		http.get(serviceUrl, response => {
			var csv = ''
			response.on('data', chunk => csv += chunk)
			response.on('end', () => {
				data = csv.toString().match(new RegExp(`^${serviceName},.+$`, 'm'))
				if (!data || !data.length) return res.sendStatus(500)
				const fields = data[0].split(',')
				const isUp = fields[17] === "UP"
				const time = fields[23]
				res.json({
					isUp: isUp,
					time: time
				})
			})

			response.on('error', e => console.log(e))
		}).on('error', e => console.log(e))
	})
})

app.listen(3000, function () {
	console.log('Listening on 3000')
})
