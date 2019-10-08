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

import GaltData from "../../../../services/galtData";
import AddStakeModal from "./modals/AddStakeModal/AddStakeModal";

const pIteration = require('p-iteration');

export default {
    name: 'oracle-stakes',
    template: require('./OracleStakes.html'),
    props: ['userWallet'],
    async mounted() {
        await this.getMultiSigs();
    },
    methods: {
        async getMultiSigs() {
            this.multisigList = await GaltData.getMulstiSigList();
            this.multisigAddress = localStorage.getItem(this.localeStorageMultisigKey) || this.multisigList[0].address;
            
            let selectedMultisigExists = this.multisigList.some((multisig) => multisig.address === this.multisigAddress);
            if(!selectedMultisigExists) {
                this.multisigAddress = this.multisigList[0].address;
            }
        },
        async getRolesWithStakes(){
            this.loading = true;
            this.roles = await GaltData.getOracleRoles(this.userWallet);
            
            const oracleStagesContract = await GaltData.getOSAofMultisig(this.multisigAddress);

            this.rolesWithStakes = await pIteration.map(this.roles, async (role) => {
                return {
                    role: role,
                    stake: await oracleStagesContract.stakeOf(this.userWallet, role),
                    minimal_stake: await this.$oraclesContract.getRoleMinimalDeposit(role)
                }
            });
            this.loading = false;
        },
        addStake(role){
            this.$root.$asyncModal.open({
                id: 'add-stake-modal',
                component: AddStakeModal,
                props: {
                    multisigAddress: this.multisigAddress,
                    // userWallet: this.userWallet,
                    role: role
                },
                onClose: () => {
                    this.getRolesWithStakes();
                }
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        multisigAddress: function() {
            localStorage.setItem(this.localeStorageMultisigKey, this.multisigAddress);
            // TODO: check - is multisig exists
            this.getRolesWithStakes();
        },
        userWallet: function() {
            this.getRolesWithStakes();
        }
    },
    computed: {
        localeStorageMultisigKey() {
            return this.userWallet + '_stakes_multisig';
        }
    },
    data() {
        return {
            localeKey: 'user_account.oracle_stakes',
            loading: true,
            roles: [],
            rolesWithStakes: [],
            multisigList: [],
            multisigAddress: null
        }
    }
}
