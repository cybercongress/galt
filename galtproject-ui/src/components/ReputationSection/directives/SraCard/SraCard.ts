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

import {EventBus, EXPLORER_DRAW_SPACE_TOKENS_LIST} from "../../../../services/events";
import SraLockerControl from "../SraLockerControl/SraLockerControl";

import * as _ from 'lodash';

export default {
    name: 'sra-card',
    template: require('./SraCard.html'),
    props: ['address', 'spaceLockerAddress', 'showJoinControl'],
    components: {SraLockerControl},
    async created() {
        this.throttleDrawSpaceTokens = _.throttle(() => {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.spaceTokens);
        }, 1000);
    },
    async mounted() {
        this.getSra();
    },
    watch: {
        async address() {
            this.getSra();
        },

        spaceTokens(){
            this.throttleDrawSpaceTokens();
        },
        
        async user_wallet() {
            this.fetchUserInfo();
        },

        async sra() {
            this.fetchUserInfo();
        }
    },
    methods: {
        async getSra() {
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.address);

            await sra.fetchGeneralInfo();
            this.sra = sra;
        },
        
        async onControlUpdate() {
            this.getSra();
            this.$emit('update');
        },

        async showSpaceTokensList(sraAddress) {
            this.loading = true;
            const sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.address);
            this.spaceTokens = await sraContract.getSpaceTokensAsync();
            this.loading = false;
        },
        
        async fetchUserInfo() {
            if(!this.user_wallet || !this.sra) {
                this.userJoined = false;
                return;
            }

            const sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.address);

            this.userTokensCount = await sraContract.getSpaceTokensByOwnerCount(this.user_wallet);

            if(!this.userTokensCount && sraContract.storage && sraContract.storage.isPrivate) {
                const newMemberProposalContract = await sraContract.storage.getNewMemberProposalContract();
                this.userSentJoinProposal = (await newMemberProposalContract.getActiveProposalsBySenderCount(this.user_wallet)) > 0;
            }
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_info',
            loading: false,
            sra: null,
            spaceTokens: [],
            userTokensCount: null,
            userSentJoinProposal: null
        }
    }
}
