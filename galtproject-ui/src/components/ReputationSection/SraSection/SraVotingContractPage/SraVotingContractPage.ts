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

import ProposalManagerCard from "../../directives/ProposalManagerCard/ProposalManagerCard";
import ProposalCard from "../../directives/ProposalCard/ProposalCard";
import SpecifyDescriptionModal from "../../../../modals/SpecifyDescriptionModal/SpecifyDescriptionModal";
import AddProposalModal from "./modals/AddProposalModal/AddProposalModal";

export default {
    name: 'sra-voting-contract-page',
    template: require('./SraVotingContractPage.html'),
    components: { ProposalCard, ProposalManagerCard },
    async created() {
        if(this.$locale.loaded) {
            this.setTabsTitle();
        } else {
            this.onLoadId = this.$locale.onLoad(this.setTabsTitle);
        }
    },
    async mounted() {
        await this.getProposalsList();
    },
    watch: {
        sra() {
            this.setIsMember();
        },
        user_wallet() {
            this.setIsMember();
        },
        proposalContract() {
            this.setTabsTitle();
        }
    },
    methods: {
        async getProposalsList() {
            this.loading = true;
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            await sra.fetchGeneralInfo();
            this.sra = sra;
            this.proposalContract = await sra.storage.getProposalManagerContract(this.$route.params.managerAddress);
            await this.updateProposalsList();
            this.loading = false;
        },
        
        async updateProposalsList() {
            this.proposalsCount = await this.proposalContract.getActiveProposalsCount();
            this.proposalsList = await this.proposalContract.getActiveProposals();
        },

        async setTabsTitle() {
            if(!this.proposalContract) {
                return;
            }
            const approvedCount = await this.proposalContract.getApprovedProposalsCount();
            const rejectedCount = await this.proposalContract.getRejectedProposalsCount();
            
            this.tabs.forEach((tab) => {
                tab.title = this.$locale.get(this.localeKey + '.tabs.' + tab.locale);
                if(tab.route === 'approved') {
                    tab.title += ` (${approvedCount})`;
                } else if(tab.route === 'rejected') {
                    tab.title += ` (${rejectedCount})`;
                }
            });
        },
        
        async setIsMember() {
            this.isSraMember = this.user_wallet && this.sra && (await this.sra.getIsMember(this.user_wallet));
        },
        
        addProposal() {
            this.$root.$asyncModal.open({
                id: 'add-proposal-modal',
                component: AddProposalModal,
                props: {
                    'sraAddress': this.$route.params.sraAddress,
                    'managerAddress': this.$route.params.managerAddress
                },
                onClose: () => {
                    this.updateProposalsList();
                }
            });
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.voting_contract_page',
            loading: true,
            sra: null,
            isSraMember: null,
            proposalContract: null,
            proposalsList: [],
            proposalsCount: null,
            tabs: [{
                route: 'overview',
                locale: 'overview',
                title: ''
            },{
                route: 'approved',
                locale: 'approved',
                title: ''
            },{
                route: 'rejected',
                locale: 'rejected',
                title: ''
            }]
        }
    }
}
