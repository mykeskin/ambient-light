const config = {
    bulbs: {
        discoverAddress: '192.168.1.255',
        bulbAddresses: ['192.168.1.1'],
        updateInterval: 30,
    },
    screenshot: {
        enable: true,
        xStart: 0,
        xEnd: 100,
        yStart: 0,
        yEnd: 100,
        interval: 100,
        maxLuminance: 0.6,
    },
    audio: {
        deviceId: -1,
        enable: true,
        volumeAverageCount: 3,
        maxLuminance: 0.6,
        fadeCoefficient: 0.9,
    },
    colors: {
        luminance: {
            r: 0.2126,
            g: 0.7152,
            b: 0.0722,
        },
        bulbColor: {
            r: 1,
            g: 1,
            b: 1,
            method: 'simple' as 'simple' | 'darken' | 'brighten',
        },
    },
};

export default config;
