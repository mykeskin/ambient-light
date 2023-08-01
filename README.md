# ambient-light

Ambient lighting for Philips WiZ smart bulbs

## Usage

-   Install dependencies:

```bash
npm install
```

-   Build code:

```bash
npm run build
```

-   Edit the available example configuration or create a new configuration
-   After setting `bulbs.discoverAddress` in the config file you can run the following to list available bulbs in your network:

```bash
npm run start -- list-bulbs --config path/to/config
```

-   List available audio input devices by running:

```bash
npm run start -- list-audio-devices --config path/to/config
```

-   Set `bulbs.bulbAddresses` and `audio.deviceId` according to above commands' results
-   Start ambient-light:

```bash
npm run start -- start --config path/to/config
```

## Notes

You may need 3rd party programs to connect audio output devices as virtual input devices.

## Acknowledgments

Thanks to [yekeskin](https://github.com/yekeskin) for the initial prototype of this project
