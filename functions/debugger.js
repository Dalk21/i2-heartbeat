const configuration = require('../config.json')
const package = require('../package.json')
const fs = require("fs")
const path = require("path")

let forceDebug = false

function centerText(text, width = 50) {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text + ' '.repeat(spaces);
}
const logs = []
function log(message, forceDebugEnable, onBoot) {
    if(forceDebugEnable == true) { forceDebugMode() };
    if(onBoot == true) {
        const width = 50;
        console.clear()
        console.log(centerText('##########################################', width));
        console.log(centerText(`STAR Heartbeat v${package.version}`, width));
        console.log(centerText(`Today is ${new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, width));
        console.log(centerText(`The time is ${new Date().toLocaleString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: 'numeric'
        })}`, width));
        const port = configuration.port || 9092;
        console.log(centerText(`View at: http://localhost:${port}`, width));
        console.log(centerText(`##########################################`, width));
        console.log(centerText(`Made by Dalk`, width));
        console.log(centerText(`Built for IntelliStar 2 (Model: ${configuration.star})`, width));
        console.log(centerText(`##########################################`, width));
        const debugtxt = path.join(__dirname, "..", "debug.txt")
        if(!fs.existsSync(debugtxt)) {
            fs.writeFileSync(debugtxt, ("utf-8", "First write to Debug logs"))
        } else {
            const current = fs.readFileSync(debugtxt, "utf-8")
            const toWrite = `${current}\n-- STARTED DEBUGGING AT ${new Date().toLocaleString()} --`
            fs.writeFileSync(debugtxt, ("utf-8", toWrite))
        }
    }
    if(configuration.debugger || forceDebug) {
        console.log(`Mist Heartbeat (v${package.version}) Debugger | ${new Date().toLocaleString()} | ${message}`)

        const debugtxt = path.join(__dirname, "..", "debug.txt")
        if(!fs.existsSync(debugtxt)) {
            fs.writeFileSync(debugtxt, ("utf-8", "First write to Debug logs"))
        } else {
            const current = fs.readFileSync(debugtxt, "utf-8")
            const toWrite = `${current}\nSTAR Heartbeat (v${package.version}) Debugger | ${new Date().toLocaleString()} | ${message}`
            fs.writeFileSync(debugtxt, ("utf-8", toWrite))
        }
        return true
    } else {
        return false
    }
}

function forceDebugMode() {
    forceDebug = true
}

module.exports = log