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

import Helper from "@galtproject/frontend-core/services/helper";
import AddProposalModal from "../../SraSection/SraVotingContractPage/modals/AddProposalModal/AddProposalModal";
import GaltData from "../../../../services/galtData";

export default {
    name: 'fund-withdrawal-limits',
    template: require('./FundWithdrawalLimits.html'),
    props: ['sraAddress'],
    async mounted() {
        this.getWithdrawalLimits();
    },
    watch: {
        sraAddress() {
            this.getWithdrawalLimits();
        },
        currentTab() {
            this.getWithdrawalLimits();
        }
    },
    methods: {
        async getWithdrawalLimits() {
            this.loading = true;

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
            
            this.changeMsWithdrawalLimitsManager = await this.sraContract.storage.getFirstContractAddressByType('change_ms_withdrawal_limits');

            this.periodLength = await this.sraContract.storage.getPeriodLength();
            this.periodLengthStr = Helper.beautyPeriod(this.periodLength);
            
            this.withdrawalLimits = await this.sraContract.storage.getActivePeriodLimits();
            
            this.loading = false;
        },
        async addWithdrawalLimit() {
            this.$root.$asyncModal.open({
                id: 'add-proposal-modal',
                component: AddProposalModal,
                props: {
                    'sraAddress': this.sraAddress,
                    'managerAddress': this.changeMsWithdrawalLimitsManager
                }
            });
        },
        async removeWithdrawalLimit(limit) {
            this.loading = true;

            GaltData.specifyDescriptionModal({localeKey: this.localeKey + '.remove_limit_description_modal'}).then((description) => {
                this.$waitScreen.show();
                
                this.$galtUser.sraNewAbstractProposal(this.sraAddress, this.changeMsWithdrawalLimitsManager, {
                    active: false,
                    erc20Contract: limit.address,
                    amount: 0,
                    description
                })
                    .then(() => {
                        this.loading = false;
                        this.$waitScreen.hide();
                        this.$notify({
                            type: 'success',
                            title: this.getLocale("success.propose_remove.title"),
                            text: this.getLocale("success.propose_remove.description")
                        });
                    })
                    .catch((e) => {
                        console.error(e);

                        this.$notify({
                            type: 'error',
                            title: this.getLocale("error.propose_remove.title"),
                            text: this.getLocale("error.propose_remove.description", {error: e.message || e})
                        });
                        this.loading = false;
                        this.$waitScreen.hide();
                    })
            }).catch((e) => { this.loading = false; })
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.withdraw_limits',
            withdrawalLimits: [],
            periodLength: null,
            periodLengthStr: '...',
            changeMsWithdrawalLimitsManager: '',
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
