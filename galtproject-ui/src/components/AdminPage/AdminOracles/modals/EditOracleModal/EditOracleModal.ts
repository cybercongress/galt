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

import {ModalItem} from '../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./EditOracleModal.html'),
    props: ['oracleAddress'],
    components: {
        ModalItem
    },
    created() {
        if(this.oracleAddress) {
            this.resultOracle.address = this.oracleAddress;

            GaltData.getOracle(this.oracleAddress)
                .then((oracle) => {
                    if(!oracle.address) {
                        this.addressDisabled = false;
                        return;
                    }
                    this.resultOracle = oracle;
                    this.resultOracle.roles = oracle.allRoles;
                })
                .catch(() => {
                    this.addressDisabled = false;
                })
        }
        
        this.getApplicationRoles();
    },
    methods: {
        async getApplicationRoles() {
            const rolesNames = await this.$galtUser.getApplicationRoles();
            this.applicationRoles = await this.$locale.setTitlesByNamesInList(rolesNames.map((role) => {return {name: role}}), 'admin_validation_roles.');
        },
        pushRole() {
            this.resultOracle.roles.push('');
            this.resultOracle = _.clone(this.resultOracle);
        },
        removeRole(index) {
            this.resultOracle.roles.splice(index, 1);
            this.resultOracle = _.clone(this.resultOracle);
        },
        ok() {
            this.saving = true;
            
            this.$galtUser.editOracle(this.resultOracle)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.save.title"),
                        text: this.getLocale("success.save.description")
                    });
                    this.$root.$asyncModal.close('edit-oracle-modal', this.resultOracle);
                })
                .catch((e) => {
                    console.error(e);
                    
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.save.title"),
                        text: this.getLocale("error.save.description")
                    });
                    this.saving = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('edit-oracle-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        saveDisabled(){
            return this.saving || !this.resultOracle.address || !this.resultOracle.position || !this.resultOracle.roles.length || this.resultOracle.roles.some((role) => !role);
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'admin.oracles.edit_oracle',
            resultOracle: {
                address: "",
                name: "",
                position: "",
                description: "",
                descriptionHashes: [],
                roles: [],
            },
            applicationRoles: [],
            saving: false
        }
    }
}
