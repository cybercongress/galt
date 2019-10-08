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

export default {
    template: require('./ValidationByRoleModal.html'),
    props: ['method', 'localeKey', 'applicationId', 'editRole', 'defaultRole', 'editMessage',  'rolesList'],
    components: {
        ModalItem
    },
    created() {
        this.resultRole = this.defaultRole;
    },
    methods: {
        ok() {
            this.$root.$asyncModal.close('validation-by-role-modal', {role: this.resultRole, message: this.resultMessage});
        },
        cancel() {
            this.$root.$asyncModal.close('validation-by-role-modal');
        }
    },
    watch: {},
    data: function () {
        return {
            resultRole: null,
            resultMessage: ""
        }
    }
}
