import { BulbData, Bulbs } from './helpers/bulbs';
import yargs from 'yargs';
import { Configs } from './helpers/config';
import { Audio } from './helpers/audio';
import { asyncInterval } from './helpers/async-interval';
import { Screen } from './helpers/screen';

async function main() {
    yargs
        .scriptName('ambient-light')
        .usage('$0 <cmd> [args]')
        .options('config', {
            type: 'string',
            default: '',
            describe: 'config name',
        })
        .middleware(({ config }) => {
            Configs.loadConfig(config);
        }, true)
        .command('list-bulbs', 'Lists ips of available bulbs', {}, printBulbs)
        .command('list-audio-devices', 'Lists available audio input devices', {}, printAudioDevices)
        .command(['start', '$0'], 'Start ambient lights', {}, start).argv;
}

async function printBulbs() {
    const bulbs = await Bulbs.listAvailableBulbs();
    if (bulbs.length === 0) {
        console.log('No bulbs found.');
    }
    bulbs.forEach((bulb, index) => {
        console.log(`${index + 1} - ${bulb.address}`);
    });
}

async function printAudioDevices() {
    const devices = Audio.listAudioDevices();
    devices.forEach((device, index) => {
        console.log(`${index + 1} - ${device.name} (id: ${device.id}, channels: ${device.maxInputChannels})`);
    });
}

async function start() {
    const audioConfig = Configs.get('audio');
    let screenshotConfigs = Configs.get('screenshot');
    const bulbConfig = Configs.get('bulbs');
    screenshotConfigs = Array.isArray(screenshotConfigs) ? screenshotConfigs : [screenshotConfigs];

    const bulbs = await Bulbs.getBulbs();

    if (audioConfig.enable) {
        let lastPeak = 0;
        Audio.subscribeToVUMeter((peak) => {
            lastPeak = Math.round(lastPeak * audioConfig.fadeCoefficient);
            if (peak > lastPeak) {
                lastPeak = peak;
            }
            bulbs.forEach((data) => {
                data.lSound = lastPeak * audioConfig.maxLuminance;
            });
        });
    }
    screenshotConfigs.forEach((screenshotConfig) => {
        if (screenshotConfig.enable) {
            const screen = new Screen(screenshotConfig);
            const screenBulbs = bulbs.filter(
                (_, index) => !screenshotConfig.bulbs || screenshotConfig.bulbs.includes(index)
            );
            asyncInterval(async () => {
                const { r, g, b, l } = await screen.getAverageScreenColor();

                screenBulbs.forEach((data) => {
                    data.r = r;
                    data.g = g;
                    data.b = b;
                    data.lColor = l * screenshotConfig.maxLuminance;
                });
            }, screenshotConfig.interval);
        }
    });

    asyncInterval(async () => {
        logColor(bulbs[0]);
        await Bulbs.updateBulb(bulbs);
    }, bulbConfig.updateInterval);
}

function logColor(bulb: BulbData) {
    let bgColorString = `\x1b[48;2;${bulb.r};${bulb.g};${bulb.b}m`;
    let resetFormatString = `\x1b[0m`;
    const r = ('000' + bulb.r).slice(-3);
    const g = ('000' + bulb.g).slice(-3);
    const b = ('000' + bulb.b).slice(-3);
    const lColor = ('000' + bulb.lColor).slice(-3);
    const lSound = ('000' + bulb.lSound).slice(-3);
    process.stdout.write(`${bgColorString}          ${resetFormatString} ${r} ${g} ${b} ${lColor} ${lSound}\r`);
}

main();
