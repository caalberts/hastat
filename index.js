var express = require('express')
var app = express()
var https = require('https')
var assets = require('./assets.json')
var status = {}

app.use(express.static('public'))

app.use((_, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

app.get('/server', function (req, res) {
	res.json(assets)
})

Object.keys(assets).forEach(assetName => {
	status[assetName] = {
		isUp: false,
		last_check: new Date().getTime()
	}

	app.get(`/server/${assetName}`, function (req, res) {
		assetUrl = `${assets[assetName]}`
		https.get(assetUrl, response => {
			const isUp = response.statusCode === 200
			if (status[assetName].isUp !== isUp) {
				status[assetName].isUp = isUp
				status[assetName].last_check = new Date().getTime()
			}
			const time = (new Date().getTime() - status[assetName].last_check) / 1000

			res.json({
				isUp: isUp,
				time: time
			})
		}).on('error', e => {
			console.log(e)
			res.sendStatus(503)
		})
	})
})

app.listen(3001, function () {
	console.log('Listening on 3001')
})
