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

export default {
    template: require('./ResubmitApplicationModal.html'),
    props: ['applicationId'],
    components: {
        ModalItem
    },
    async created() {
        this.$plotManagerContract.getApplicationById(this.applicationId).then(async (application) => {
            await application.resolvePromise;
            this.application = application;
            this.application.level = application.spaceToken.level;
            this.application.contour = application.spaceToken.contour;
            this.application.heights = application.spaceToken.heights;
            this.application.ledgerIdentifier = this.application.ledgerIdentifierName;
            this.application.oldCredentialsHash = this.application.credentialsHash;
        });
    },
    methods: {
        async ok() {
            this.sending = true;
            
            this.warnText = this.getLocale('tip.saving');
            
            if(this.application.editCredentials) {
                this.application.credentialsHash = this.$plotManagerContract.generateCredentialsHash(this.application.fullName, this.application.documentId);
            } else {
                this.application.credentialsHash = this.application.oldCredentialsHash;
            }

            this.$galtUser.resubmitPlotManagetApplication(this.application).then(() => {
                this.$root.$asyncModal.close('resubmit-application-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.save.title'),
                    text: this.getLocale('success.save.description')
                });
            }).catch((e) => {
                console.error(e);
                this.warnText = '';

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.save.title'),
                    text: this.getLocale('error.save.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('resubmit-application-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        // countryList () {
        //     this.$store.state.locale;
        //     return this.$locale.get('application_country_list');
        // },
        sendDisabled(){
            let allFields = this.application.ledgerIdentifier;// && this.application.country
            if(this.application.editCredentials) {
                allFields = allFields && this.application.documentId && this.application.fullName;
            }
            return this.sending || !allFields;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_applications.resubmit_application_modal',
            application: {
                editCredentials: false,
                ledgerIdentifier: null,
                documentId: null,
                fullName: null,
                country: null
            },
            invalidFee: null,
            actionTypes: [],
            warnText: null,
            sending: false
        }
    }
}
