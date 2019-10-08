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

import Explorer from "../../../Explorer/Explorer";
import {EventBus, EXPLORER_DRAW_SPACE_TOKENS_LIST, EXPLORER_HIGHLIGHT_CONTOUR} from "../../../../services/events";

import * as _ from 'lodash';

export default {
    name: 'space-token-map',
    template: require('./SpaceTokenMap.html'),
    components: {Explorer},
    props: ['curSpaceToken', 'allSpaceTokens'],
    created() {
        
    },
    mounted() {
        this.render();
        // EventBus.$emit(EXPLORER_HIGHLIGHT_CONTOUR, {
        //     contour: this.curSpaceToken.contour,
        //     highlightType: 'info'
        // });
    },
    methods: {
        render() {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.allSpaceTokens.filter(spaceToken => !spaceToken.hide).map((spaceToken) => {
                spaceToken = _.clone(spaceToken);
                if(spaceToken.current) {
                    spaceToken.highlightContour = spaceToken.contour;
                    spaceToken.highlightContourType = 'info';
                }
                return spaceToken;
            }));
        }
    },
    data() {
        return {

        };
    },
    watch: {
        'allSpaceTokens'() {
            this.render();
        }
    },
}
