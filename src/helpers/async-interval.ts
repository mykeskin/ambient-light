export function asyncInterval(func: () => Promise<void>, intervalTime) {
    const timeoutCall = async () => {
        const time = Date.now();
        try {
            await func();
        } catch (ex) {
            console.log(ex);
        } finally {
            const diff = Date.now() - time;
            setTimeout(timeoutCall, intervalTime - diff);
        }
    };
    setTimeout(timeoutCall, intervalTime);
}
