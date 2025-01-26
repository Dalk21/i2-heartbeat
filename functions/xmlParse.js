const debug = require("./debugger")
const config = require("../config.json")
const path = require("path")
const fs = require("fs")

function getProperty(property, xmlData)  {
    try {
        const value = xmlData.split(`${property}" value="`)[1].split(`"`)[0]
        debug(`XML Parser | Got value ${value} from property ${property}.`)
        return value
    } catch {
        return ""
    }
}

async function getMPC() {
    const mpcPath = path.join(config.i2Path, "Managed", "Config", "MachineProductCfg.xml")
    const mpc = await fs.readFileSync(mpcPath, "utf-8")
    return mpc
}

async function returnNearbyCities() {
    const mpcData = await getMPC();
    const nearbyCities = [];
    nearbyCities.push(getProperty("PrimaryLocation", mpcData))
    let index = 1;
    let city = getProperty(`NearbyLocation${index}`, mpcData);

    while (city) {
        nearbyCities.push(city);
        index += 1;
        city = getProperty(`NearbyLocation${index}`, mpcData);
    }
    return nearbyCities;
}

async function returnAlertCities() {
    const mpcData = await getMPC();
    const nearby = await returnNearbyCities();
    const county = getProperty("primaryCounty", mpcData)
    const secondaryCounties = String(getProperty("secondaryCounties", mpcData)).split(",")
    const secondaryZones = String(getProperty("secondaryZones", mpcData)).split(",")
    const final = []
    nearby.forEach(city => {final.push(city)})
    final.push(county)
    if(secondaryCounties.length == 2) {
        secondaryCounties.forEach(county => {final.push(county)})
    }
    secondaryZones.forEach(zone => {final.push(zone)})
    return final;
}

module.exports = {getProperty, returnNearbyCities, returnAlertCities}