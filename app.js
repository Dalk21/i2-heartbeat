const express = require('express')
const configuration = require('./config.json')
const functions = require('./functions/index')
const path = require('path')
const i2Model = configuration.star
const fs = require('fs')
const app = new express()

// Home page
app.use(express.static('public'))

let heartbeatInfo = {}

heartbeatInfo = configuration.heartbeat

// Schedule heartbeat system
functions.heartbeatSys.heartbeat();

// Cue endpoint; /cue/azul/3600/4/0 as example (4 is presentation ID, do ldl for ldl and sidebar for misc, 0 is background, check /resources/bgCodes.txt)
app.get('/cue/:flavor/:duration/:pid/:background', (req, res) => {
    const {duration, flavor, pid, background} = req.params
    functions.cue(duration, flavor, pid, (background?background:8))
    res.send(`Cued domestic/${flavor} for ${duration} using the provided configuration with background ${(background?background:5098)}.`)
})

app.get('/cue-stop/:id', (req, res) => {
    functions.killPresentation(req.params.id)
    res.send('Done.')
})

const resourcesPath = path.join(__dirname, 'resources', i2Model);
app.use('/resources', express.static(resourcesPath));

app.get('/kill/:i2process', (req, res) => {
    const {i2process} = req.params
    functions.kill(i2process)
    res.send(`Killed ${i2process}.`)
})

app.get('/headend/mpc', async (req, res) => {
    const mpcPath = path.join(configuration.i2Path, "Managed", "Config", "MachineProductCfg.xml")
    const mpc = await fs.readFileSync(mpcPath, "utf-8")
    res.type("text/xml")
    res.send(mpc)
})

app.get('/force/heartbeat', async (req, res) => {
    functions.heartbeatSys.forceHeartbeat()
    res.send("Forced heartbeat.")
})

app.get('/heartbeat/get', async (req, res) => {
    const heartbeatInfo = await functions.heartbeatSys.readHeartbeat()
    res.json(heartbeatInfo)
})

app.get('/heartbeat/post/:setting/:value', (req, res) => {
    const validSettings = ["flavor","duration","heartbeatEnabled","heartbeatOn","flavorLdl","background"]
    const numbers = ["0","1","2","3","4","5","6","7","8","9"]
    if(validSettings.includes(req.params.setting)) {
        let newValue = req.params.value
        if(newValue == "true") {
            newValue = Boolean(true)
        }
        if(newValue == "false") {
            newValue = Boolean(false)
        }
        if(numbers.includes(String(newValue).slice(0,1))) {
            newValue = Number(newValue)
        }
        heartbeatInfo[req.params.setting] = newValue
        functions.heartbeatSys.updateHeartbeat(heartbeatInfo)
        res.send(`Successfully set ${req.params.setting} to ${newValue} in heartbeat settings. Please wait for the next cycle for the adjustment to take place.`)
    } else {
        res.status(404).send(`Invalid setting.`)
        functions.debug("User attempted to input incorrect heartbeat setting")
    }
})


app.listen(configuration.port, () => {
    functions.debug("Booted", false, true)
    functions.debug(`Mist Heartbeat Panel listening on port ${configuration.port}.`)
    functions.debug(`View the Mist Heartbeat panel at http://localhost:${configuration.port}/`)
})

if(process.argv.includes("--debug")) {
    functions.debug("Forcing debug mode...", true, true)
}