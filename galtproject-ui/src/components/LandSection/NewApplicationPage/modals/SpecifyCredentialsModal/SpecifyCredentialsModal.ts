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
    template: require('./SpecifyCredentialsModal.html'),
    props: [ ],
    components: {
        ModalItem
    },
    created() {

    },
    mounted(){

    },
    methods: {
        ok() {
            this.$root.$asyncModal.close('specify-credentials-modal', this.userData);
        },
        cancel() {
            this.$root.$asyncModal.close('specify-credentials-modal');
        }
    },
    computed: {
        // countryList () {
        //     this.$store.state.locale;
        //     return this.$locale.get('application_country_list');
        // }
    },
    data: function () {
        return {
            userData: {
                fullName: "",
                documentId: "",
                // country: "RU"
            }
        }
    }
}
