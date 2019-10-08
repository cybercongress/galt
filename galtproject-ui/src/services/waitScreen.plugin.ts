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

import {
    EventBus, 
    WAIT_SCREEN_CHANGE_TEXT, 
    WAIT_SCREEN_HIDE, 
    WAIT_SCREEN_SHOW,
    WAIT_SCREEN_SET_OPERATION_ID
} from "./events";

export default {
    install (Vue, options: any = {}) {

        let defaultCenterText = options.centerText;
        let defaultRightTopText = options.rightTopText;

        Vue.prototype.$waitScreen = {
            show: function(centerText?, rightTopText?) {
                EventBus.$emit(WAIT_SCREEN_SHOW, {
                    centerText: centerText || defaultCenterText,
                    rightTopText: rightTopText || defaultRightTopText
                });
            },
            hide: function() {
                EventBus.$emit(WAIT_SCREEN_HIDE);
            },
            setDefaultText: function(centerText, rightTopText) {
                defaultCenterText = centerText;
                defaultRightTopText = rightTopText;
            },
            changeCenterText: function (centerText) {
                EventBus.$emit(WAIT_SCREEN_CHANGE_TEXT, {
                    centerText: centerText || ' '
                });
            },
            changeCenterSubText: function (centerSubText) {
                EventBus.$emit(WAIT_SCREEN_CHANGE_TEXT, {
                    centerSubText: centerSubText || ' '
                });
            },
            changeRightTopText: function (centerText) {
                EventBus.$emit(WAIT_SCREEN_CHANGE_TEXT, {
                    centerText: centerText || ' '
                });
            },
            setOperationId(operationId) {
                EventBus.$emit(WAIT_SCREEN_SET_OPERATION_ID, operationId);
            }
        };
    }
}
