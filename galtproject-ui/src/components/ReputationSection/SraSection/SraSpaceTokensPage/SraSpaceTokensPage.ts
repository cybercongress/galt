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
import {EventBus, EXPLORER_DRAW_SPACE_TOKEN, EXPLORER_DRAW_SPACE_TOKENS_LIST} from "../../../../services/events";

import SpaceTokenCard from "../../../../directives/SpaceTokenCard/SpaceTokenCard";

import * as _ from 'lodash';

export default {
    name: 'sra-space-lockers-page',
    template: require('./SraSpaceTokensPage.html'),
    components: {Explorer, SpaceTokenCard},
    async created() {
        this.throttleDrawSpaceTokens = _.throttle(() => {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.spaceTokens);
        }, 1000);
        
        this.debounceGetSpaceTokens = _.throttle(() => {
            this.getSpaceTokensList();
        }, 300);

        this.debounceGetSpaceTokens();
    },
    async mounted() {
        
    },
    methods: {
        async getSpaceTokensList() {
            this.loading = true;
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
            this.spaceTokens = await this.sraContract.getSpaceTokensAsync(() => {
                this.loading = false;
            });
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        spaceTokens(){
            this.throttleDrawSpaceTokens();
        },
        sraAddress() {
            this.debounceGetSpaceTokens();
        }
    },
    computed: {
        sraAddress() {
            return this.$route.params.sraAddress;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.space_tokens_page',
            loading: true,
            spaceTokens: []
        }
    }
}
