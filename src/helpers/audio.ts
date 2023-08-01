import portAudio from 'naudiodon';
import VUMeter from 'vu-meter';
import { Configs } from './config';

export class Audio {
    static listAudioDevices() {
        const audioDevices = portAudio.getDevices();
        return audioDevices.filter((obj) => obj.maxInputChannels);
    }

    static subscribeToVUMeter(callback: (data: number) => void) {
        const audioConfig = Configs.get('audio');
        const averages = [];
        let average = 0;
        for (let i = 0; i < audioConfig.volumeAverageCount; i++) {
            averages.push(0);
        }
        const device = portAudio.AudioIO({
            inOptions: {
                channelCount: 2,
                sampleFormat: portAudio.SampleFormat16Bit,
                sampleRate: 44100,
                deviceId: audioConfig.deviceId,
                closeOnError: false,
            },
        });
        const meter = new VUMeter({});
        device.pipe(meter);

        meter.on('data', (data) => {
            const val = averages.shift();
            const current = Math.max((data[0] + data[1]) / 2 + 100, 0);
            const diff = Math.round(((current - average) / (100 - average)) * 100);
            averages.push(current / audioConfig.volumeAverageCount);
            average += current / audioConfig.volumeAverageCount - val;
            callback(diff);
        });
        device.start();
    }
}
