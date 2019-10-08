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

import GaltData from "../../../services/galtData";
import Explorer from "../../Explorer/Explorer";
import {EventBus, EXPLORER_DRAW_SPACE_TOKENS_LIST} from "../../../services/events";

// const pIteration = require('p-iteration');

export default {
    name: 'choose-for-space-locker-page',
    template: require('./ChooseForSpaceLockerPage.html'),
    components: {Explorer},
    async mounted() {
        await this.getSpaceTokens();

        this.$store.watch((state) => state.user_wallet, () => this.getSpaceTokens());
    },
    methods: {
        async getSpaceTokens() {
            if(!this.user_wallet) {
                return;
            }
            this.loading = true;
            this.spaceTokens = await GaltData.getUserSpaceTokens(this.user_wallet);
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.spaceTokens);
            this.loading = false;
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'reputation.choose_for_space_locker',
            loading: true,
            spaceTokens: [],
        }
    }
}
