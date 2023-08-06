import JSON5 from 'json5';
import defaultConfig, { Config } from '../default-config';
import fs from 'fs';

export class Configs {
    static config: Config;
    static loadConfig(configName?: string) {
        let loadedConfig: Partial<Config> = {};
        if (configName) {
            loadedConfig = JSON5.parse(fs.readFileSync(configName, { encoding: 'utf8' }));
        }
        Configs.config = mergeObjects(defaultConfig, loadedConfig);
    }

    static get<T extends keyof Config>(key: T): Config[T] {
        return Configs.config[key];
    }
}

function mergeObjects<T>(obj1: T, obj2?: Partial<T>): T {
    const newObj: any = {};
    for (const key in obj1) {
        if (Array.isArray(obj1[key]) || (obj2 && Array.isArray(obj2[key]))) {
            newObj[key] = (obj2 && obj2[key]) || obj1[key];
        } else if (typeof obj1[key] === 'object') {
            newObj[key] = mergeObjects(obj1[key], obj2 && obj2[key]);
        } else {
            newObj[key] = obj2 && obj2[key] != null ? obj2[key] : obj1[key];
        }
    }
    return newObj;
}
