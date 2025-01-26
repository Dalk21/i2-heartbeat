const debug = require('./debugger')
const cue = require('./cue')
const killPres = require("./killPresentation")
const config = require('../config.json')
const fs = require('fs')
const path = require('path')

async function heartbeat() {
    const heartbeatConfigFirst = await readHeartbeat()
    let ldl = heartbeatConfigFirst.flavorLdl
    cue(100000000, heartbeatConfigFirst.flavorLdl, "ldl3");
	if(heartbeatConfigFirst.sidebarEnabled) {
        cue(100000000, heartbeatConfigFirst.flavorSidebar, "sidebar2");
    }
    setInterval(async () => {
        const heartbeatConfigLo = await readHeartbeat()
        cue(100000000, heartbeatConfigLo.flavorLdl, "ldl3");
		if(heartbeatConfigLo.sidebarEnabled) {
            cue(100000000, heartbeatConfigLo.flavorSidebar, "sidebar2");
        }
    }, 3600000);
    const cueHeartbeat = async () => {
        const heartbeatConfig = await readHeartbeat()
        if (heartbeatConfig.heartbeatEnabled) {
            cue(heartbeatConfig.duration, heartbeatConfig.flavor, "4", heartbeatConfig.background);
            setTimeout(() => {
				killPres("sidebar2")
                killPres("ldl3")
            }, 19250);
            setTimeout(() => {
                cue(100000000, heartbeatConfig.flavorLdl, "ldl3");
				if(heartbeatConfig.sidebarEnabled) {
                    cue(100000000, heartbeatConfig.flavorSidebar, "sidebar2");
                }
            }, ((Math.round((heartbeatConfig.duration / 30)) * 1000)) + 50);
            debug(`Heartbeat | Successfully cued domestic/${heartbeatConfig.flavor} for ${heartbeatConfig.duration} frames.`);
        } else {
            debug(`Heartbeat | Ignored heartbeat cue. Reason: disabled`);
        }
        scheduleNextHeartbeat();
    };
    const millisecondsToNextHeartbeat = async () => {
        const heartbeatConfig = await readHeartbeat()
        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();
        const currentMillisecond = now.getMilliseconds();
        let nextHeartbeatMinute = Math.ceil(currentMinute / 10) * 10 + heartbeatConfig.heartbeatOn;
        if (nextHeartbeatMinute >= 60) {
            nextHeartbeatMinute -= 60;
        }
        const nextHour = now.getHours() + Math.floor((currentMinute + heartbeatConfig.heartbeatOn) / 60);
        const nextCueTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextHour, nextHeartbeatMinute, 0, 0);
        let delay = nextCueTime - now;
        if(delay > 600000) {
            delay -= 600000
        }
        if(delay > 600000) {
            delay = 60000
        }
        if (delay < 0) {
            delay += 10 * 60 * 1000;
        }
        const date = new Date(Date.now() + delay);
        debug(`Next heartbeat scheduled for ${date.toLocaleTimeString()}.`);
        heartbeatConfig.nextHeartbeatAuto = date.toLocaleTimeString()
        await updateHeartbeat(heartbeatConfig)
        return delay;
    };
    const scheduleNextHeartbeat = async () => {
        const delay = await millisecondsToNextHeartbeat();
        setTimeout(() => {
            cueHeartbeat();
        }, delay);
    };
    scheduleNextHeartbeat();
}

async function forceHeartbeat() {
    const heartbeatConfig = await readHeartbeat()
        if (heartbeatConfig.heartbeatEnabled) {
            cue(heartbeatConfig.duration, heartbeatConfig.flavor, "4", heartbeatConfig.background);
            setTimeout(() => {
                killPres("ldl3")
				killPres("sidebar2")
            }, 19250);
            setTimeout(() => {
                cue(100000000, heartbeatConfig.flavorLdl, "ldl3");
				if(heartbeatConfig.sidebarEnabled) {
                    cue(100000000, config.flavorSidebar, "sidebar2");
                }
            }, ((Math.round((heartbeatConfig.duration / 30)) * 1000)) + 50);
            debug(`Heartbeat | Forcefully cued domestic/${heartbeatConfig.flavor} for ${heartbeatConfig.duration} frames.`);
        } else {
            debug(`Heartbeat | Ignored heartbeat cue. Reason: disabled`);
        }
        }

async function updateHeartbeat(heartbeatInfo) {
    const raw = await fs.readFileSync(path.join(__dirname, '..', 'config.json'))
    const full = JSON.parse(raw)
    full.heartbeat = heartbeatInfo
    await fs.writeFileSync(path.join(__dirname, '..', 'config.json'), JSON.stringify(full, null, 2))
    debug(`Successfully updated heartbeat.`)
    return full
}

async function readHeartbeat() {
    const raw = await fs.readFileSync(path.join(__dirname, '..', 'config.json'))
    const full = JSON.parse(raw)
    debug(`Successfully read heartbeat.`)
    return full.heartbeat
}

module.exports = {heartbeat,updateHeartbeat,readHeartbeat,forceHeartbeat}