import robot from 'robotjs';
import { Configs } from './config';

export class Screen {
    static x: number;
    static y: number;
    static width: number;
    static height: number;
    static initializeScreen() {
        const { xStart, xEnd, yStart, yEnd } = Configs.get('screenshot');
        const screenSize = robot.getScreenSize();
        Screen.x = screenSize.width * (xStart / 100);
        Screen.y = screenSize.height * (yStart / 100);
        Screen.width = screenSize.width * (xEnd / 100) - Screen.x;
        Screen.height = screenSize.height * (yEnd / 100) - Screen.y;
    }

    static async getAverageScreenColor() {
        const { bulbColor, luminance } = Configs.get('colors');
        const img = robot.screen.capture(Screen.x, Screen.y, Screen.width, Screen.height);
        let { r, g, b } = colorAverage(img.image);
        const l = Math.round((luminance.r * r + luminance.g * g + luminance.b * b) / 2.55);
        r = Math.round(r * bulbColor.r);
        g = Math.round(g * bulbColor.g);
        b = Math.round(b * bulbColor.b);
        if (bulbColor.method === 'darken') {
            const darker = Math.round(Math.min(r, g, b) / 2);
            r -= darker;
            g -= darker;
            b -= darker;
        } else if (bulbColor.method === 'brighten') {
            const coefficient = 255 / Math.max(r, g, b);
            r = Math.round(r * coefficient);
            g = Math.round(g * coefficient);
            b = Math.round(b * coefficient);
        }
        r = Math.min(r, 255);
        g = Math.min(g, 255);
        b = Math.min(b, 255);
        return { r, g, b, l };
    }
}

function colorAverage(buffer) {
    let count = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < buffer.length; i += 12) {
        b += buffer[i];
        g += buffer[i + 1];
        r += buffer[i + 2];
        count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return { r, g, b };
}
