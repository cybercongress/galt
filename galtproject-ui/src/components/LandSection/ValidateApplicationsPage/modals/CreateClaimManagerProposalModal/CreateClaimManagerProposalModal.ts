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

import {ModalItem} from '../../../../../directives/AsyncModal/index';
import FeeInput from "../../../../../directives/FeeInput/FeeInput";
import GaltData from "../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./CreateClaimManagerProposalModal.html'),
    props: ['applicationId'],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        this.onLoadId = this.$locale.onLoad(() => {
            this.getActionTypes();
        });
        this.getActionTypes();
        
        this.proposal = {
            applicationId: this.applicationId,
            blameList: [],
            action: 'approve',
            message: ''
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    methods: {
        async findRolesForOracle(oracleAddress){
            this.$set(this.rolesLoadingByOracle, oracleAddress, true);
            
            let oraclesRoles = await GaltData.getOracleRoles(oracleAddress);
            
            oraclesRoles = await this.$locale.setTitlesByNamesInList(oraclesRoles.map((role) => {
                return {name: role}
            }), 'admin_validation_roles.');
            
            this.$set(this.rolesByOracle, oracleAddress, oraclesRoles);
            
            this.$set(this.rolesLoadingByOracle, oracleAddress, false);
        },
        async getActionTypes() {
            this.actionTypes = await this.$locale.setTitlesByNamesInList(this.$claimManagerContract.actionTypes, 'claim_manager.action_types.');
        },
        async ok() {
            this.sending = true;
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.createClaimManagerProposal(this.proposal).then(() => {
                this.$root.$asyncModal.close('create-claim-manager-proposal-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send.title'),
                    text: this.getLocale('success.send.description')
                });
            }).catch((e) => {
                console.error(e);
                this.warnText = '';
                this.sending = false;

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send.title'),
                    text: this.getLocale('error.send.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('create-claim-manager-proposal-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            let disabled = this.sending || !this.proposal.action;
            
            if(this.proposal.action == 'approve') {
                disabled = disabled || !this.proposal.blameList.length;
            } else {
                disabled = disabled || !this.proposal.message;

            }
            return disabled;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'validate_applications.create_claim_manager_proposal_modal',
            proposal: {
                applicationId: null,
                blameList: [],
                action: null,
                message: ''
            },
            actionTypes: [],
            invalidBlameItems: {},
            rolesLoadingByOracle: {},
            rolesByOracle: {},
            warnText: null,
            sending: false
        }
    }
}
