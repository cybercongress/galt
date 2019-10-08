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

import {ModalItem} from '../../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./AddStakeModal.html'),
    props: ['role', 'multisigAddress'],
    components: {
        ModalItem
    },
    async created() {
        this.$locale.waitForLoad().then(() => {
            this.roleTitle = this.$locale.get('admin_validation_roles.' + this.role);
        });
        this.oracleStakesContract = await GaltData.getOSAofMultisig(this.multisigAddress);
    },
    methods: {
        approve() {
            if(this.stake > this.user_galt_balance) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale("error.not_enough_balance.title", {value: this.user_galt_balance}),
                    text: this.getLocale("error.not_enough_balance.description", {value: this.user_galt_balance})
                });
            }
            
            this.approving = true;

            this.$galtUser.approveGalt(this.oracleStakesContract.address, this.stake)
                .then(() => {
                    this.approved = true;
                    this.approving = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.approve.title"),
                        text: this.getLocale("success.approve.description")
                    });
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.approve.title"),
                        text: this.getLocale("error.approve.description")
                    });
                    this.approving = false;
                })
        },
        ok() {
            if(this.stake > this.user_galt_balance) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale("error.not_enough_balance.title", {value: this.user_galt_balance}),
                    text: this.getLocale("error.not_enough_balance.description", {value: this.user_galt_balance})
                });
            }
            
            this.sending = true;
            
            this.$galtUser.addOracleStake(this.multisigAddress, this.role, this.stake)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.send.title"),
                        text: this.getLocale("success.send.description")
                    });
                    this.$root.$asyncModal.close('add-stake-modal');
                })
                .catch((e) => {
                    console.error(e);
                    
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.send.title"),
                        text: this.getLocale("error.send.description")
                    });
                    this.sending = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('add-stake-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        approvedDisabled(){
            return this.approved || this.approving;
        },
        sendDisabled(){
            return !this.approved || this.sending;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        }
    },
    watch: {
        async stake() {
            this.approved = (await this.$galtUser.getGaltAllowance(this.oracleStakesContract.address)) >= this.price;
        }
    },
    data: function () {
        return {
            localeKey: 'user_account.oracle_stakes.add_stake_modal',
            roleTitle: "",
            stake: null,
            approved: false,
            approving: false,
            sending: false
        }
    }
}
