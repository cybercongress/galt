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
    template: require('./EditRolesModal.html'),
    props: ['applicationTypeName'],
    components: {
        ModalItem
    },
    created() {
        this.getOraclesRoles();
    },
    methods: {
        async getOraclesRoles() {
            this.oraclesRoles = await this.$galtUser.getApplicationRolesData(this.applicationTypeName);
            this.deleted = !this.oraclesRoles.length;
        },
        deleteRoles() {
            this.deleting = true;

            this.$galtUser.deleteApplicationRoles(this.applicationTypeName)
                .then(() => {
                    this.deleted = true;
                    this.deleting = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.delete.title"),
                        text: this.getLocale("success.delete.description")
                    });
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.delete.title"),
                        text: this.getLocale("error.delete.description")
                    });
                    this.deleting = false;
                })
        },
        ok() {
            this.saving = true;
            
            this.$galtUser.setApplicationRoles(this.oraclesRoles, this.applicationTypeName)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.save.title"),
                        text: this.getLocale("success.save.description")
                    });
                    this.$root.$asyncModal.close('edit-roles-modal', this.oraclesRoles);
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
            this.$root.$asyncModal.close('edit-roles-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        deleteDisabled(){
            return this.deleted || this.deleting;
        },
        saveDisabled(){
            return !this.deleted || this.saving || !this.oraclesRoles.length || this.oraclesRoles.some((role) => !role.rewardShare) || this.oraclesRoles.some((role) => !role.name) || this.shareSumNot100;
        },
        shareSumNot100(){
            let sum = 0;
            this.oraclesRoles.forEach((role) => {
                sum += parseInt(role.rewardShare);
            });
            return sum != 100;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'admin.oracles_roles.edit_roles',
            oraclesRoles: [],
            deleted: false,
            deleting: false,
            saving: false
        }
    }
}
