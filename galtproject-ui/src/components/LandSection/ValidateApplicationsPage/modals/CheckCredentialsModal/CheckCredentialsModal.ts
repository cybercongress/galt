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

export default {
    template: require('./CheckCredentialsModal.html'),
    props: [ 'credentialsHash' ],
    components: {
        ModalItem
    },
    created() {

    },
    mounted(){

    },
    methods: {
        ok() {
            this.$root.$asyncModal.close('check-credentials-modal', true);
        },
        cancel() {
            this.$root.$asyncModal.close('check-credentials-modal');
        }
    },
    computed: {
        validateResult() {
            if(!this.userData.fullName || !this.userData.documentId) {
                return 'waiting';
            }
            const currentCredentialsHash = this.$plotManagerContract.generateCredentialsHash(this.userData.fullName, this.userData.documentId);
            console.log('credentialsHash', currentCredentialsHash, 'for', this.userData.fullName, this.userData.documentId);
            const isValid = currentCredentialsHash == this.credentialsHash;

            if(isValid) {
                return 'valid';
            } else {
                return 'invalid';
            }
        }
    },
    watch: {},
    data: function () {
        return {
            userData: {
                fullName: "",
                documentId: ""
            }
        }
    }
}
