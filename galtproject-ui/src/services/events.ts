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

import Vue from 'vue';

export const EventBus = new Vue();

export const EXPLORER_DRAW_AREA = 'explorer-draw-area';
export const EXPLORER_DRAW_AREAS_LIST = 'explorer-draw-areas-list';
export const EXPLORER_DRAW_SPACE_TOKEN = 'explorer-draw-space-token';
export const EXPLORER_DRAW_SPACE_TOKENS_LIST = 'explorer-draw-space-tokens-list';
export const EXPLORER_MOUSE_CLICK = 'explorer-mouse-click';
export const EXPLORER_HIGHLIGHT_GEOHASHES = 'explorer-highlight-geohashes';
export const EXPLORER_TEMP_GEOHASHES = 'explorer-temp-geohashes';
export const EXPLORER_HIGHLIGHT_CONTOUR = 'explorer-highlight-contour';

export const WAIT_SCREEN_SHOW = 'wait-screen-show';
export const WAIT_SCREEN_HIDE = 'wait-screen-hide';
export const WAIT_SCREEN_CHANGE_TEXT = 'wait-screen-change-text';
export const WAIT_SCREEN_SET_OPERATION_ID = 'wait-screen-set-operation-id';

export const REPUTATION_DELEGATION_CHANGED = 'reputation_delegation_changed';

export function GetEventName(eventName, componentName) {
    return eventName + (componentName == 'main' ? '' : '-' + componentName);
}
