const {exec} = require('child_process')
const debug = require('./debugger')
const config = require('../config.json')

function kill(presentation)  {
    exec(`cd "${config.i2Path}" && exec -async cancelPres("PresentationId=${presentation}")`, {windowsHide:true})
    debug(`Killed presentation ${presentation}.`)
}

module.exports = kill