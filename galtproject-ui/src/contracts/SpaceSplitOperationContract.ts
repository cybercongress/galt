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

const galtUtils = require('@galtproject/utils');
import GaltData from "../services/galtData";
import * as pIteration from "p-iteration";

const EthContract = require('../libs/EthContract');

export default class SpaceSplitOperationContract extends EthContract {
    active = false;
    doneStage = '';
    finishInfo = null;
    
    stages = [
        {id: 0, name: 'none'},
        {id: 1, name: 'contract_init'},
        {id: 2, name: 'polygons_prepare'},
        {id: 3, name: 'polygons_init'},
        {id: 4, name: 'segments_add'},
        {id: 5, name: 'martinez_rueda_process'},
        {id: 6, name: 'intersects_points_add'},
        {id: 7, name: 'weiler_atherton_build'},
        {id: 8, name: 'polygons_finish'}
    ];
    
    async getDoneStage(){
        this.doneStage = (this.stages[await this.massCallMethod("doneStage")] || {} as any).name;
        return this.doneStage;
    }
    
    async getClippingContour() {
        return (await this.massCallMethod("getClippingContour")).map(galtUtils.numberToGeohash);
    }

    async getSubjectTokenId() {
        return await this.massCallMethod("subjectTokenId");
    }

    async getFinishInfo() {
        this.finishInfo = await this.massCallMethod("getFinishInfo");
        this.finishInfo.subjectContourResult = this.finishInfo.subjectContourResult.map(galtUtils.numberToGeohash);

        this.finishInfo.resultContours = [];
        for(let i = 0; i < this.finishInfo.resultContoursCount; i++) {
            let resultContour = await this.massCallMethod("getResultContour", [i]);
            resultContour = resultContour.map(galtUtils.numberToGeohash);
            this.finishInfo.resultContours.push(resultContour);
        }
        return this.finishInfo;
    }

    async getSubjectContour() {
        return (await this.massCallMethod("getSubjectContour")).map(galtUtils.numberToGeohash);
    }

    async prepareSubjectPolygon(sendOptions){
        return await this.sendMethod(sendOptions, "prepareSubjectPolygon");
    }
    async prepareClippingPolygon(sendOptions){
        return await this.sendMethod(sendOptions, "prepareClippingPolygon");
    }
    async prepareAllPolygons(sendOptions){
        return await this.sendMethod(sendOptions, "prepareAllPolygons");
    }
    async initSubjectPolygon(sendOptions){
        return await this.sendMethod(sendOptions, "initSubjectPolygon");
    }
    async initClippingPolygon(sendOptions){
        return await this.sendMethod(sendOptions, "initClippingPolygon");
    }
    async initAllContours(sendOptions){
        return await this.sendMethod(sendOptions, "initAllContours");
    }
    async prepareAndInitAllPolygons(sendOptions){
        return await this.sendMethod(sendOptions, "prepareAndInitAllPolygons");
    }
    async addSubjectPolygonSegments(sendOptions){
        return await this.sendMethod(sendOptions, "addSubjectPolygonSegments");
    }
    async addClippingPolygonSegments(sendOptions){
        return await this.sendMethod(sendOptions, "addClippingPolygonSegments");
    }
    async addAllPolygonsSegments(sendOptions){
        return await this.sendMethod(sendOptions, "addAllPolygonsSegments");
    }
    async processMartinezRueda(sendOptions){
        return await this.sendMethod(sendOptions, "processMartinezRueda");
    }
    async addIntersectedPoints(sendOptions) {
        return await this.sendMethod(sendOptions, "addIntersectedPoints");
    }
    async buildResultPolygon(sendOptions) {
        return await this.sendMethod(sendOptions, "buildResultPolygon");
    }
    async isBuildResultFinished() {
        return await this.massCallMethod("isBuildResultFinished");
    }
    async buildSubjectPolygonOutput(sendOptions) {
        return await this.sendMethod(sendOptions, "buildSubjectPolygonOutput");
    }
    async finishAllPolygons(sendOptions) {
        return await this.sendMethod(sendOptions, "finishAllPolygons");
    }
}
