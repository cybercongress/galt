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

import ProposalControl from "../ProposalControl/ProposalControl";
import ProposalFieldOutput from "../ProposalFieldOutput/ProposalFieldOutput";

export default {
    name: 'proposal-card',
    template: require('./ProposalCard.html'),
    props: ['proposalId', 'managerAddress', 'sraAddress'],
    components: {ProposalControl, ProposalFieldOutput},
    async mounted() {
        this.getProposal();
    },
    watch: {
        async user_wallet() {
            this.getProposal();
        },
        async sraAddress() {
            this.getProposal();
        },
        async proposalId() {
            this.getProposal();
        },
    },
    methods: {
        async getProposal() {
            this.loading = true;
            this.sra = null;
            this.proposal = null;
            this.fields = [];
            
            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            await sra.fetchGeneralInfo();
            this.sra = sra;
            this.proposalContract = await sra.storage.getProposalManagerContract(this.managerAddress);
            this.proposal = await this.proposalContract.getProposalObjById(this.proposalId);
            this.fields = this.proposalContract.getProposalOutputFields();
            this.loading = false;
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
            localeKey: 'reputation.proposal_info',
            sra: null,
            loading: true,
            proposalContract: null,
            proposal: null,
            proposalShares: null,
            fields: []
        }
    }
}
