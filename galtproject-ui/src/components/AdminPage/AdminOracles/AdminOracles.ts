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
import EditOracleModal from "./modals/EditOracleModal/EditOracleModal";
import * as _ from 'lodash';

export default {
    name: 'admin-oracles',
    template: require('./AdminOracles.html'),
    props: [],
    mounted() {
        this.getAllOracles();
    },
    watch: {
        
    },
    methods: {
        async getAllOracles(){
            this.oracles = await GaltData.getAllOracles();
            this.filteredOracles = this.oracles;
        },
        async findOracle() {
            this.oracleNotFound = false;
            this.oracleError = false;
            this.oracleInfo = null;
            
            if(!this.oracleToFind) {
                this.filteredOracles = this.oracles;
                return;
            }
            this.filteredOracles = this.oracles.filter((oracle) => {
                return _.includes(oracle.address, this.oracleToFind);
            });
            
            if(!this.filteredOracles.length) {
                this.fetchOracleToFind();
            }
        },
        fetchOracleToFind(){
            if(!this.oracleToFind) {
                return;
            }
            GaltData.getOracle(this.oracleToFind)
                .then((oracle) => {
                    if(!oracle.allRoles.length) {
                        this.oracleNotFound = true;
                        return;
                    }
                    this.oracles.push(oracle);
                    this.findOracle();
                })
                .catch(() => {
                    this.oracleError = true;
                })
        },
        updateOracleInfo(oracleAddress) {
            this.oracles.some(oracle => {
                if(oracle.address == oracleAddress) {
                    GaltData.getOracle(oracle.address)
                        .then((getOracle) => { _.extend(oracle, getOracle); })
                        .catch(() => {})
                }
                return oracle.address == oracleAddress;
            })
        },
        editOracle(oracleAddress?){
            if(!oracleAddress && this.oracleNotFound) {
                oracleAddress = this.oracleToFind;
            }
            
            this.$root.$asyncModal.open({
                id: 'edit-oracle-modal',
                component: EditOracleModal,
                props: {
                    oracleAddress: oracleAddress,
                },
                onClose: (resultOracle) => {
                    if(!resultOracle) {
                        return;
                    }
                    this.getAllOracles();
                }
            });
        },
        deactivateOracle(oracleAddress){
            this.$galtUser.deactivateOracle(oracleAddress)
                .then(() => {
                    this.updateOracleInfo(oracleAddress);
                    
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.deactivate.title"),
                        text: this.getLocale("success.deactivate.description")
                    });
                })
                .catch((e) => {
                    console.error(e);
                    
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.deactivate.title"),
                        text: this.getLocale("error.deactivate.description")
                    });
                })
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            oracleToFind: "",
            oracles: [],
            filteredOracles: [],
            localeKey: 'admin.oracles',
            oracleForChangeStatus: null,
            oracleInfo: null,
            oracleNotFound: false,
            oracleError: false
        }
    }
}
