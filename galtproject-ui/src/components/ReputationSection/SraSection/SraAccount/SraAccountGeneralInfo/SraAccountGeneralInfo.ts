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

import GaltData from "../../../../../services/galtData";
import {EventBus, REPUTATION_DELEGATION_CHANGED} from "../../../../../services/events";
import MemberIdentification from "../../../directives/MemberIdentification/MemberIdentification";
import AddProposalModal from "../../SraVotingContractPage/modals/AddProposalModal/AddProposalModal";

export default {
    name: 'sra-account-general-info',
    template: require('./SraAccountGeneralInfo.html'),
    props: ['userWallet', 'sraAddress'],
    components: {MemberIdentification},
    async mounted() {
        this.getInfo();
        EventBus.$on(REPUTATION_DELEGATION_CHANGED, this.getInfo.bind(this))
    },
    watch: {
        userWallet() {
            this.getInfo();
        }
    },
    methods: {
        async getInfo() {
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            this.balance = await this.sraContract.getBalanceOf(this.userWallet);
            this.balanceStr = GaltData.beautyNumber(this.balance);
            this.ownedBalance = await this.sraContract.getOwnedBalanceOf(this.userWallet);
            this.ownedBalanceStr = GaltData.beautyNumber(this.ownedBalance);
            this.delegationsCount = await this.sraContract.getDelegationsCount(this.userWallet);
            this.delegatedByCount = await this.sraContract.getDelegatedByCount(this.userWallet);
            this.spaceTokensCount = await this.sraContract.getSpaceTokensByOwnerCount(this.userWallet);
            
            if(this.sraContract.storage) {
                this.identification = await this.sraContract.storage.getMemberIdentification(this.userWallet);
            }
        },

        async addIdentification() {
            const memberIdentificationManagerAddress = await this.sraContract.storage.getFirstContractAddressByType('member_identification');
            this.$root.$asyncModal.open({
                id: 'add-proposal-modal',
                component: AddProposalModal,
                props: {
                    'sraAddress': this.$route.params.sraAddress,
                    'managerAddress': memberIdentificationManagerAddress
                }
            });
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.sra_account.general_info',
            balanceStr: null,
            ownedBalanceStr: null,
            delegationsCount: null,
            delegatedByCount: null,
            spaceTokensCount: null,
            identification: null
        }
    }
}
