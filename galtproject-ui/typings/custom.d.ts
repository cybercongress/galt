declare module "worker-loader!*" {
    class WebpackWorker extends Worker {
        prototype: any;
        constructor();
    }

    export default WebpackWorker;
}