const {exec} = require('child_process')
const debug = require('./debugger')
const config = require('../config.json')

function cue(duration, flavor, presentationId, logo)  {
    const backgroundsList = require(`../resources/${config.star}/backgrounds.json`)
    let backgroundDescription = "Unknown"
let presId = presentationId ? presentationId : "1"
    let cueCmd = `PresentationId=${presentationId ? presentationId : "1"},Duration=${duration},Flavor=domestic/${flavor}`
    let debugMsg = `Successfully cued ${flavor} for ${(duration / 900 * 30 * 1000) / 1000 } seconds`
    if(presentationId) {
        debugMsg = `${debugMsg} with presId ${presentationId}`
    } else {
        debugMsg = `${debugMsg} with presId 1`
    }
    if(logo && logo > 10) {
        cueCmd = `${cueCmd}${logo > 10 ? ',File=0,VideoBehind=000, ' + `Logo=domesticAds/TAG${logo},` : ','}`
        let bgInfo = {description:"No description found"}
        backgroundsList.forEach(bg =>{
            if(bg.ID == logo) {
                bgInfo.description = bg.Description
            }
        })
        backgroundDescription = bgInfo.description
        debugMsg = `${debugMsg} and background ${logo} (${backgroundDescription}).`
    } else if (logo && logo == 9) {
        const randomLogo = backgroundsList
        const rnl = (randomLogo[Math.round(randomLogo.length * Math.random())] || randomLogo[0])
        cueCmd = `${cueCmd}${logo ? ',File=0,VideoBehind=000, ' + `Logo=domesticAds/TAG${rnl.ID},` : ','}`
        debugMsg = `${debugMsg} and random background ${rnl.ID} (${rnl.Description}).`
    } else {
        debugMsg = `${debugMsg} with a generic background.`
    }
exec(`cd "${config.i2Path}" && exec -async loadPres("${cueCmd}")`, {windowsHide:true})
console.log(cueCmd)
    setTimeout(() => {
        exec(`cd "${config.i2Path}" && exec -async runPres("PresentationId=${presId},StartTime=${formatStart(Math.round(new Date()) + 10000)}")`, {windowsHide:true})
    }, 10000);
    debug(debugMsg)
}

function formatStart(time) {
    const date = new Date(time);
    const pad = (num, size) => num.toString().padStart(size, '0');
    const month = pad(date.getUTCMonth() + 1, 2);  // Months are zero-indexed, so add 1
    const day = pad(date.getUTCDate(), 2);
    const year = date.getUTCFullYear();
    const hours = pad(date.getUTCHours(), 2);
    const minutes = pad(date.getUTCMinutes(), 2);
    const seconds = pad(date.getUTCSeconds(), 2);
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}:00`;
} // 10/10/2024 15:22:30:00

module.exports = cue