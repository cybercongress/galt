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
    name: 'proposal-manager-card',
    template: require('./ProposalManagerCard.html'),
    props: ['address', 'sraAddress'],
    components: {SraLockerControl},
    async created() {
        
    },
    async mounted() {
        this.getProposalManager();
    },
    watch: {
        async address() {
            this.getProposalManager();
        },

        async sraAddress() {
            this.getProposalManager();
        }
    },
    methods: {
        async getProposalManager() {
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            await sra.fetchGeneralInfo();
            this.sra = sra;
            
            this.proposalManager = await sra.storage.getProposalManagerContract(this.address);
            const localeKey = 'reputation.default_whitelist_contracts.' + this.proposalManager.contractType;
            if(this.$locale.has(localeKey + '.type')) {
                this.proposalManager.contractTypeStr = this.$locale.get(localeKey + '.type');
            }
            if(this.$locale.has(localeKey + '.description')) {
                this.proposalManager.description = this.$locale.get(localeKey + '.description');
            }
            this.activeProposalCount = await this.proposalManager.getActiveProposalsCount();
            this.threshold = await this.proposalManager.getThreshold();
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
            localeKey: 'reputation.proposal_manager_info',
            loading: false,
            proposalManager: null,
            activeProposalCount: null,
            threshold: null
        }
    }
}
