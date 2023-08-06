import { Bulb, discover } from 'wikari';
import { Configs } from './config';
export type BulbData = {
    r: number;
    g: number;
    b: number;
    lColor: number;
    lSound: number;
    bulb: Bulb;
};
export class Bulbs {
    static async listAvailableBulbs() {
        const { discoverAddress } = Configs.get('bulbs');
        const bulbs = await discover({ addr: discoverAddress });
        return bulbs;
    }

    static async getBulbs() {
        const { bulbAddresses } = Configs.get('bulbs');
        const bulbs: BulbData[] = [];
        for (const addr of bulbAddresses) {
            const bulb = (await discover({ addr }))[0];
            if (!bulb) {
                throw new Error(`Could not connect to ${addr}`);
            }
            await bulb.turn(true);
            const pilot = (await bulb.getPilot()).result;
            bulbs.push({
                r: pilot.r,
                g: pilot.g,
                b: pilot.b,
                lColor: 0,
                lSound: 0,
                bulb,
            });
        }
        return bulbs;
    }

    static async updateBulb(bulbs: BulbData[]) {
        await Promise.all(
            bulbs.map((data) => {
                const dimming = Math.max(Math.min(data.lColor + data.lSound, 100), 10);
                return data.bulb.sendRaw(
                    {
                        method: 'setPilot',
                        params: {
                            r: data.r,
                            g: data.g,
                            b: data.b,
                            dimming,
                        },
                    },
                    false
                );
            })
        );
    }
}
