const {exec} = require('child_process')
const debug = require('./debugger')
const config = require('../config.json')

function kill(process)  {
    exec(`cd "${config.i2Path}" && exec -async restartProcess("ProcessName=${process}")`, {windowsHide:true})
    debug(`Killed ${process}.`)
}

module.exports = kill