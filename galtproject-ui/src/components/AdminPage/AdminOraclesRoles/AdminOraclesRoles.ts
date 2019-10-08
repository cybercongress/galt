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

import GaltData from "../../../services/galtData";
import EditRolesModal from "./modals/EditRolesModal/EditRolesModal";

export default {
    name: 'admin-oracles-roles',
    template: require('./AdminOraclesRoles.html'),
    props: [],
    async mounted() {
        this.applicationTypeName = GaltData.getApplicationsTypesList()[0].name;
        this.getOraclesRoles();
        this.applicationsTypes = await this.$locale.setTitlesByNamesInList(GaltData.getApplicationsTypesList(), "application_contracts_types.");
    },
    watch: {
        applicationTypeName() {
            this.getOraclesRoles();
        }
    },
    methods: {
        async getOraclesRoles(){
            this.oraclesRoles = await this.$galtUser.getApplicationRolesData(this.applicationTypeName);
        },
        editRoles(){
            this.$root.$asyncModal.open({
                id: 'edit-roles-modal',
                component: EditRolesModal,
                props: {
                    applicationTypeName: this.applicationTypeName
                },
                onClose: (resultOracle) => {
                    this.getOraclesRoles();
                }
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'admin.oracles_roles',
            applicationsTypes: [],
            applicationTypeName: null,
            oraclesRoles: []
        }
    }
}
