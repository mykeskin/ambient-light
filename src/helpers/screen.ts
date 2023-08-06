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
        } else if (bulbColor.method === 'saturate') {
            const { saturationBase, valueBase } = bulbColor.saturate;
            const hsv = rgbToHsv(r, g, b);
            const s = Math.min(1, hsv.s * (saturationBase - hsv.v));
            const v = Math.min(1, hsv.v * (valueBase - hsv.v));
            ({ r, g, b } = hsvToRgb(hsv.h, s, v));
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

function rgbToHsv(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const v = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = v - min;
    const s = v == 0 ? 0 : d / v;
    let h: number;

    if (v == min) {
        h = 0;
    } else {
        switch (v) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = Math.round(v * (1 - s) * 255);
    const q = Math.round(v * (1 - f * s) * 255);
    const t = Math.round(v * (1 - (1 - f) * s) * 255);
    v = Math.round(v * 255);
    switch (i % 6) {
        case 0:
            return { r: v, g: t, b: p };
        case 1:
            return { r: q, g: v, b: p };
        case 2:
            return { r: p, g: v, b: t };
        case 3:
            return { r: p, g: q, b: v };
        case 4:
            return { r: t, g: p, b: v };
        case 5:
            return { r: v, g: p, b: q };
    }
}
