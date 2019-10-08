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

import ProposalCard from "../../../directives/ProposalCard/ProposalCard";

export default {
    name: 'sra-voting-finalized-page',
    template: require('./SraVotingFinalizedPage.html'),
    components: { ProposalCard },
    props: ['proposalsType'],
    async created() {
        
    },
    async mounted() {
        await this.getProposalsList();
    },
    methods: {
        async getProposalsList() {
            this.loading = true;
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            await sra.fetchGeneralInfo();
            this.sra = sra;
            this.proposalContract = await sra.storage.getProposalManagerContract(this.$route.params.managerAddress);
            if(this.proposalsType === 'approved') {
                this.proposalsList = await this.proposalContract.getApprovedProposals();
            } else {
                this.proposalsList = await this.proposalContract.getRejectedProposals();
            }
            this.loading = false;
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        proposalsType() {
            this.getProposalsList();
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        localeKey() {
            return 'reputation.sra_section.voting_contract_page.' + this.proposalsType
        }
    },
    data() {
        return {
            loading: true,
            sra: null,
            proposalsList: [],
            proposalsCount: null
        }
    }
}
