const license = "Q29tbU5ldCB4RCBVc2Vy"
let heartbeatEnabled = false // Do not change

let cues = {}
fetch("/resources/cues.json").then(c => c.json()).then(c => {
    cues = c
})

async function runCue(section, index, pid, initialBg) {
    const cue = cues[section][index]
    let bg = 0
    if (initialBg) {
        bg = initialBg
    }
    const runCue = await fetch(`/cue/${cue.product}/${cue.duration}/${pid}/${bg}`)
    return true
}

async function kill(process) {
    const runKill = await fetch(`/kill/${process}`)
    showPopup(`Killed ${process}.`)
    return true
}

async function runCueCustom(duration, cue, pid, bg) {
    const runCue = await fetch(`/cue/${cue}/${duration}/${pid}/${bg}`)
    return true
}

async function getHeartbeatInfo() {
    const hb = await fetch("/heartbeat/get");
    const heartbeat = await hb.json();
    document.getElementById('heartbeat-on').placeholder = `${heartbeat.heartbeatOn}`
    document.getElementById('hb-detail').innerText = `Heartbeat Cue Time (example; ${heartbeat.heartbeatOn}: Cues on xx:x${heartbeat.heartbeatOn} every 10 minutes):`
    if (heartbeat.heartbeatEnabled) {
        document.getElementById('heartbeatStatus').innerText = `Heartbeat is enabled. Next cue: ${heartbeat.nextHeartbeatAuto}. Flavor: domestic/${heartbeat.flavor}. Duration: ${convertFramesToSeconds(heartbeat.duration)}s.`
        document.getElementById('heartbeat-toggle').innerText = `Disable Heartbeat`
        heartbeatEnabled = true
    } else {
        document.getElementById('heartbeatStatus').innerText = `Heartbeat is disabled.`
        document.getElementById('heartbeat-toggle').innerText = `Enable Heartbeat`
        heartbeatEnabled = false
    }
}

async function updateHeartbeatInfo(setting, value) {
    const hb = await fetch(`/heartbeat/post/${setting}/${value}`);
    getHeartbeatInfo()
}

function updateHeartbeatLF() {
    const selectedIndex = document.getElementById('hb-select').value;
    const selectedBgIndex = document.getElementById('hb-bg').value;
    const duration = document.getElementById('hb-duration').value;
    const selectedLF = cues.lf[selectedIndex].product;
    updateHeartbeatInfo("flavor", selectedLF)
    updateHeartbeatInfo("duration", duration * 30)
    showPopup(`Heartbeat will now use ${cues.lf[selectedIndex].name}.`);
    if (selectedBgIndex > -1) {
        const selectedBg = backgrounds[Number(selectedBgIndex)];
        updateHeartbeatInfo("background", Number(selectedBg.bg))
        showPopup(`Heartbeat will now use ${cues.lf[selectedIndex].name} with background ${selectedBg.name}.`);
    } else if (selectedBgIndex == -9998) {
        updateHeartbeatInfo("background", Number(9))
        showPopup(`Heartbeat will now use ${cues.lf[selectedIndex].name} with a random background.`);
    } else {
        updateHeartbeatInfo("background", 0)
        showPopup(`Heartbeat will now use ${cues.lf[selectedIndex].name} with no background.`);
    }
}

function forceHeartbeatCue() {
    fetch("/force/heartbeat")
    showPopup("Forced a heartbeat.")
}

function updateHeartbeatLDL() {
    const selectedIndex = document.getElementById('hb2-select').value;
    const selectedLDL = cues.ldl[selectedIndex].product;
    updateHeartbeatInfo("flavorLdl", selectedLDL)
    showPopup(`Heartbeat will now use ${cues.ldl[selectedIndex].name} for LDL.`);
}

getHeartbeatInfo();
setInterval(getHeartbeatInfo, 120000)

document.addEventListener('DOMContentLoaded', () => {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value || ''}${expires}; path=/`;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; Max-Age=-99999999;`;
    }

    function toggleVideoVisibility() {
        //const video = document.getElementById('azul');
        const videoCookie = getCookie('azul');
        if (videoCookie === 'false') {
            //video.pause()
            //video.style.display = 'none';
        } else {
            //video.play()
            //video.style.display = 'block';
        }
    }

    function toggleAzul() {
        const videoCookie = getCookie('azul');
        if (videoCookie === 'false') {
            setCookie('azul', 'true', 7);
        } else {
            setCookie('azul', 'false', 7);
        }
        toggleVideoVisibility();
    }
    toggleVideoVisibility();
    document.getElementById('toggleAzul').addEventListener('click', toggleAzul);
});

async function headendInfo() {
    const headend = await fetch("/headend/mpc")
    const headendInfo = await headend.text()
    document.getElementById('star').innerText = `${getProperty("HeadendName", headendInfo)} | ${getProperty("HeadendId", headendInfo)}`
}

function getProperty(property, xmlData)  {
    try {
        const value = xmlData.split(`"${property}" value="`)[1].split(`"`)[0]
        return value
    } catch {
        return ""
    }
}
headendInfo()

const backgrounds = []

async function setBgList() {
    const backgroundsFetch = await fetch("/resources/backgrounds.json")
    const backgroundsData = await backgroundsFetch.json()
    backgroundsData.forEach((background, index) => {
        backgrounds.push({
            name: background.Description,
            bg: background.ID,
            index: index
        })
    });
    populateBg()
    populateBg2()
}

function populateBg() {
    const backgroundSelect = document.getElementById("lf-bg")
    const optionBase = document.createElement('option');
    optionBase.value = -9999;
    optionBase.textContent = `Default (Generic)`;
    backgroundSelect.appendChild(optionBase);
    const optionBase2 = document.createElement('option');
    optionBase2.value = -9998;
    optionBase2.textContent = `Random Background`;
    backgroundSelect.appendChild(optionBase2);
    backgrounds.forEach((background, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${background.name} (${background.bg})`;
        backgroundSelect.appendChild(option);
    });
}

function populateBg2() {
    const backgroundSelect = document.getElementById("hb-bg")
    const optionBase = document.createElement('option');
    optionBase.value = -9999;
    optionBase.textContent = `Default (Generic)`;
    backgroundSelect.appendChild(optionBase);
    const optionBase2 = document.createElement('option');
    optionBase2.value = -9998;
    optionBase2.textContent = `Random Background`;
    backgroundSelect.appendChild(optionBase2);
    backgrounds.forEach((background, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${background.name} (${background.bg})`;
        backgroundSelect.appendChild(option);
    });
}

setBgList()

function populateDropdown(pageId) {
    const selectElementIds = {
        lf: 'lf-select',
        ldl: 'ldl-select',
        misc: 'misc-select',
        hb: 'hb-select',
        hb2: 'hb2-select'
    };

    const durationInputIds = {
        lf: 'lf-duration',
        ldl: 'ldl-duration',
        misc: 'misc-duration',
        hb: 'hb-duration'
    };

    const pageCues = cues[pageId];
    const selectElement = document.getElementById(selectElementIds[pageId]);
    const durationElement = document.getElementById(durationInputIds[pageId]);

    selectElement.innerHTML = ''; // Clear existing options

    pageCues.forEach((cue, index) => {
        const option = document.createElement('option');
        option.value = index; // Store the index in the value attribute
        option.textContent = cue.name;
        selectElement.appendChild(option);
    });

    // Set default duration based on the first cue
    if (pageCues.length > 0) {
        durationElement.value = convertFramesToSeconds(pageCues[0].duration);
    }

    // Add event listener for changing the dropdown
    selectElement.addEventListener('change', () => {
        const selectedIndex = selectElement.value;
        durationElement.value = convertFramesToSeconds(pageCues[selectedIndex].duration);
    });
}

function convertFramesToSeconds(frames) {
    return frames / 900 * 30
}

function submitLF() {
    const selectedIndex = document.getElementById('lf-select').value;
    const selectedBgIndex = document.getElementById('lf-bg').value;
    const duration = document.getElementById('lf-duration').value;
    const pid = (document.getElementById('lf-id').value || 3);
    const selectedLF = cues.lf[selectedIndex].name;
    if (selectedBgIndex > -1) {
        const selectedBg = backgrounds[Number(selectedBgIndex)];
        runCue("lf", selectedIndex, pid, selectedBg.bg)
        showPopup(`Cued ${selectedLF} for ${duration} seconds with background ${selectedBg.name}`);
    } else if (selectedBgIndex == -9998) {
        runCue("lf", selectedIndex, pid, 9)
        showPopup(`Cued ${selectedLF} for ${duration} seconds with a random background.`);
    } else {
        runCue("lf", selectedIndex, pid)
        showPopup(`Cued ${selectedLF} for ${duration} seconds with no background`);
    }
}

function submitLDL() {
    const selectedIndex = document.getElementById('ldl-select').value;
    const duration = document.getElementById('ldl-duration').value;
    const pid = (document.getElementById('ldl-id').value || 1);
    const selectedLdl = cues.ldl[selectedIndex].name;
    runCue("ldl", selectedIndex, pid)
    showPopup(`Cued ${selectedLdl} for ${duration} seconds`);
}

function submitMisc() {
    const selectedIndex = document.getElementById('misc-select').value;
    const duration = document.getElementById('misc-duration').value;
    const pid = (document.getElementById('misc-id').value || 2);
    const selectedMisc = cues.misc[selectedIndex].name;
    runCue("misc", selectedIndex, pid)
    showPopup(`Cued ${selectedMisc} for ${duration} seconds`);
}

async function stopPresentation(id) {
    await fetch(`/cue-stop/${id}`)
    showPopup(`Stopped ${id}.`)
}

function framesToSeconds(frames) {
    return frames / 900 * 30
}

function secondsToFrames(seconds) {
    return seconds / 30 * 900
}

function submitCustom() {
    const selected = document.getElementById('custom-select').value;
    const bg = document.getElementById('custom-bg').value;
    const duration = document.getElementById('custom-duration').value;
    const pid = (document.getElementById('custom-id').value || 2);
    runCueCustom(duration, selected, pid, (bg || 0))
    showPopup(`Cued domestic/${selected} for ${convertFramesToSeconds(duration)} seconds`);
}

function showPopup(message) {
    const popup = document.getElementById('popup');
    popup.textContent = message;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
}

function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = (page.id === pageId) ? 'block' : 'none';
    });

    // Populate dropdowns when navigating to pages
    if (['lf', 'ldl', 'misc', 'hb', 'hb2'].includes(pageId)) {
        populateDropdown(pageId);
    }
}

// Initialize to show the home page by default
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
});