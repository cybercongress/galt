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
import * as _ from 'lodash';

export default {
    template: require('./AttachDocumentsModal.html'),
    props: ['applicationId', 'contractName', 'methodName'],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        this.application = {
            id: this.applicationId,
            contractType: this.contractName,
            documents: []
        }
    },
    methods: {
        async ok() {
            this.sending = true;
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.attachDocuments(this.application).then(() => {
                this.$root.$asyncModal.close('attach-documents-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send.title'),
                    text: this.getLocale('success.send.description')
                });
            }).catch((e) => {
                console.error(e);
                this.warnText = '';

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send.title'),
                    text: this.getLocale('error.send.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('attach-documents-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || !this.application.documents.length;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'validate_applications.attach_documents_modal',
            application: {
                id: null,
                contractType: null,
                documents: []
            },
            warnText: null,
            sending: false
        }
    }
}
