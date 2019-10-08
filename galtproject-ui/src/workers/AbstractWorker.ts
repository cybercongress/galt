/*
 * Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka),
 * [Dima Starodubcev](https://github.com/xhipster), 
 * [Valery Litvin](https://github.com/litvintech) by 
 * [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
 * ​
 * Copyright ©️ 2018 Galt•Core Blockchain Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) and 
 * Galt•Space Society Construction and Terraforming Company by 
 * [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
 */

export default class AbstractWorker {
    workerName: any;
    ctx: any;

    constructor(workerName, ctx){
        this.workerName = workerName;
        this.ctx = ctx;
        
        console.log(workerName, ctx);

        this.ctx.onmessage = event => {
            if(event.data.method) {
                const result = this[event.data.method](event.data.data);
                if(result && result.then) {
                    result.then((asyncResult) => {
                        this.methodFinish(event.data, asyncResult);
                    })
                } else {
                    this.methodFinish(event.data, result);
                }
            } else {
                console.error('unrecognized worker event', event);
            }
        };
    }

    sendEvent(eventName, eventData) {
        this.ctx.postMessage({
            event: eventName,
            data: eventData
        });
    }

    methodFinish(eventData, methodResult) {
        this.sendEvent(eventData.finishEvent, methodResult);
    }
}