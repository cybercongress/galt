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

import * as _ from 'lodash';
import * as ngeohash from 'ngeohash';
import * as L from 'leaflet/src/Leaflet';
(window as any).L = L;
require('leaflet-edge-scale-bar/leaflet.edgescalebar');

export default class ExplorerMap {
    map: any;
    layer: any;
    elementId: string;

    lastCenter: any;
    lastZoom: any;

    zoomByGeohashLength = {
        1: 2,
        2: 4,
        3: 8,
        4: 10,
        5: 13,
        6: 15,
        7: 16,
        8: 18,
        9: 20,
        10: 22,
        11: 25,
        12: 28,
        13: 30,
        14: 32,
        15: 34,
        16: 36
    };

    highlightedGeohashesPolygons = [];
    highlightedContoursPolygons = [];
    renderedElements = [];
    renderedElementsByName = {};
    spaceTokensIdsByContourKey = {};
    
    renderedPopup = null;

    constructor(elementId) {
        this.elementId = elementId;
        this.map = L.map(this.elementId, {
            keyboard: false
        });
        this.setLayer();
    }
    
    destroy() {
        this.map.off();
        this.map.remove();
    }

    setLayer(){
        // this.layer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3RlbXkiLCJhIjoiY2luZDYweml5MDA1OXd6bHkzcmIwdnR6eSJ9.1UbUtQ7TfiMTEIotzSOi7w', {
        this.layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3RlbXkiLCJhIjoiY2luZDYweml5MDA1OXd6bHkzcmIwdnR6eSJ9.1UbUtQ7TfiMTEIotzSOi7w', {
            attribution: '<a href="https://github.com/andromedaspace/geohash-viewer">Geohash Viewer</a>',
            maxZoom: 30,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1Ijoic3RlbXkiLCJhIjoiY2luZDYweml5MDA1OXd6bHkzcmIwdnR6eSJ9.1UbUtQ7TfiMTEIotzSOi7w',
            keyboard: false
        }).addTo(this.map);

        setTimeout(() => {
            this.map.invalidateSize();
        }, 1000);

        L.edgeScaleBar().addTo(this.map);
    }

    setView(geohash, zoom?) {
        let gps;
        if(geohash) {
            gps = ngeohash.decode(geohash);
            zoom = zoom || this.zoomByGeohashLength[geohash.length];
        } else {
            gps = this.lastCenter;
            zoom = zoom || this.lastZoom;
        }
        this.map = this.map.setView([gps.latitude || gps.lat, gps.longitude || gps.lng], zoom);

        this.lastZoom = this.map.getZoom();
        this.lastCenter = this.map.getCenter();

        this.map.on('zoom resize', () => {
            this.lastZoom = this.map.getZoom();
        });
        this.map.on('move', () => {
            this.lastCenter = this.map.getCenter();
        });
        // this.drawGeohash(geohash, ExplorerMap.getGeohashLatlngs(geohash));
    }

    clear(){
        this.map.remove();
        this.map = L.map(this.elementId);
        this.setLayer();
    }

    clearElements(){
        if(this.renderedElements.length) {
            this.renderedElements.forEach((el) => {
                el.remove();
            });
            this.renderedElements = [];
        }
    }

    clearElementsByName(name){
        if(this.renderedElementsByName[name] && this.renderedElementsByName[name].length) {
            this.renderedElementsByName[name].forEach((el) => {
                el.remove();
            });
            this.renderedElementsByName[name] = [];
        }
    }

    drawGeohashes(geohashes){
        geohashes.forEach(geohash => {
            const latlngs = ExplorerMap.getGeohashLatlngs(geohash);
            this.drawGeohash(geohash, latlngs);
        });
    }

    drawContour(name, geohashes, spaceTokenId = null, level = 0, options = {}) {
        const latlngs = [];

        Object.values(geohashes).forEach((geohash, index) => {
            const latlng = ngeohash.decode(geohash);
            latlngs.push([latlng.latitude, latlng.longitude]);
        });
        
        const fillColorByLevel = [
            '#66BB6A', 
            '#FFECB3', 
            '#FFE57F', 
            '#FFE082', 
            '#FFD740', 
            '#FFD54F', 
            '#FFCA28', 
            '#FFC107', 
            '#FFB300', 
            '#FFA000', 
            '#FF8F00'];
        const strokeColorByLevel = [
            '#004D40', 
            '#FB8C00', 
            '#FB8C00', 
            '#FB8C00', 
            '#FB8C00', 
            '#FB8C00', 
            '#FB8C00', 
            '#FB8C00', 
            '#E65100', 
            '#E65100', 
            '#E65100'];

        const polygon = L.polygon(latlngs, {
                fillColor: options['fillColor'] || fillColorByLevel[level],
                color: options['color'] || strokeColorByLevel[level],
                opacity: 1,
                weight: 0.9,
                fillOpacity: 0.5,
                fillRule: 'nonzero', 
                stroke: true
            })
            .addTo(this.map);

        const polygonGps = polygon.getBounds().getCenter();

        if(!this.renderedElementsByName[name]) {
            this.renderedElementsByName[name] = [];
        }
        
        if(!_.isNull(spaceTokenId)) {
            const marker = L.marker([polygonGps.lat, polygonGps.lng], {
                zIndexOffset: 50
            }).addTo(this.map);
            this.renderedElementsByName[name].push(marker);
            marker.contour = geohashes;
            marker.contourKey = geohashes.join(',');
            marker.spaceTokenId = spaceTokenId;
            if(!this.spaceTokensIdsByContourKey[marker.contourKey]) {
                this.spaceTokensIdsByContourKey[marker.contourKey] = [];
            }
            if(!_.includes(this.spaceTokensIdsByContourKey[marker.contourKey], spaceTokenId)) {
                this.spaceTokensIdsByContourKey[marker.contourKey].push(spaceTokenId);
            }
            marker.on('click', this.triggerContourElementClick());
            
            polygon.spaceTokenId = spaceTokenId;
            polygon.on('click', this.triggerContourElementClick());
        }
        
        this.renderedElementsByName[name].push(polygon);
        
        polygon.contour = geohashes;
        polygon.contourKey = geohashes.join(',');
    }
    
    getElementsByDrawName(name) {
        return this.renderedElementsByName[name] || [];
    }

    highlightContour(name, geohashes, highlightType = 'error') {
        const latlngs = [];

        Object.values(geohashes).forEach((geohash, index) => {
            const latlng = ngeohash.decode(geohash);

            latlngs.push([latlng.latitude, latlng.longitude]);
        });

        if(!this.highlightedContoursPolygons) {
            this.highlightedContoursPolygons = [];
        }
        
        const typeToColor = {
            'error': 'red',
            'warn': 'orange',
            'info': '#00B8D4'
        };

        const polygon = L.polygon(latlngs, {
            color: typeToColor[highlightType],
            opacity: 0.1,
            weight: 0.5,
            fillOpacity: 0.5,
            fillRule: 'nonzero',
        })
            .addTo(this.map);

        if(!this.renderedElementsByName[name]) {
            this.renderedElementsByName[name] = [];
        }
        this.renderedElementsByName[name].push(polygon);
        
        this.highlightedContoursPolygons.push(polygon);
    }

    highlightGeohashes(name, geohashes, highlightType = 'error') {
        if(!this.highlightedGeohashesPolygons) {
            this.highlightedGeohashesPolygons = [];
        }
        
        this.clearElementsByName(name + '_geohashes');
        
        geohashes.forEach((geohash) => {
            let latlngs = ExplorerMap.getGeohashLatlngs(geohash);
            let polygonConf;
            
            const defaultWeight = 5;
            const expandWeight = 12;

            if(highlightType == 'error') {
                polygonConf = {fillColor: "red", color: "red", weight: defaultWeight};
            } else if(highlightType == 'warn') {
                polygonConf = {fillColor: "orange", color: "orange", weight: defaultWeight};
            }

            const polygon = L.polygon(latlngs, polygonConf).addTo(this.map);
            polygon.on('mouseover', (event) => {
                polygon.setStyle({weight: expandWeight});
            });
            polygon.on('mouseout', (event) => {
                polygon.setStyle({weight: defaultWeight});
            });
            polygon.on('click', (event) => {
                this.geohashClickClickHandlers.forEach(callback => callback(geohash, polygon));
            });
            
            if(!this.renderedElementsByName[name + '_geohashes']) {
                this.renderedElementsByName[name + '_geohashes'] = [];
            }
            this.renderedElementsByName[name + '_geohashes'].push(polygon);
        });
    }
    
    clearHighlight(type?){
        if(!type || type == 'geohashes') {
            if(this.highlightedGeohashesPolygons && this.highlightedGeohashesPolygons.length) {
                this.highlightedGeohashesPolygons.forEach((polygon) => {
                    polygon.remove();
                });
                this.highlightedGeohashesPolygons = [];
            }
        }
        
        if(!type || type == 'contour') {
            if(this.highlightedContoursPolygons && this.highlightedContoursPolygons.length) {
                this.highlightedContoursPolygons.forEach((polygon) => {
                    polygon.remove();
                });
                this.highlightedContoursPolygons = [];
            }
        }
    }

    getCenterForTerritory(polygons) {
        let totalLat = 0, totalLng = 0, counter = 0;

        polygons.forEach(polygon => {
            const gps = polygon.getBounds().getCenter();

            totalLat += gps.lat;
            totalLng += gps.lng;
            counter++;
        });

        const averageLat = totalLat / counter;
        const averageLng = totalLng / counter;

        this.map.setView([averageLat, averageLng], 17);
    }

    drawGeohash(geohash, latlngs) {
        return L.polygon(latlngs, {color: "#333", weight: 0.3, opacity: 1}).addTo(this.map);
    }

    static getGeohashLatlngs(geohash) {
        if (!geohash) {
            return [];
        }

        let poly = ngeohash.decode_bbox(geohash);

        return [
            [poly[0], poly[1]],
            [poly[2], poly[1]],
            [poly[2], poly[3]],
            [poly[0], poly[3]],
            [poly[0], poly[1]]
        ];
    }

    onMouseMove(callback) {
        this.map.on('mousemove', (event) => {
            const latlng = event.latlng;
            callback({
                lat: latlng.lat,
                lng: latlng.lng,
                geohash: ngeohash.encode(latlng.lat, latlng.lng, 12)
            });
        }, 100);
    }

    onMouseClick(callback) {
        this.map.on('click', (event) => {
            const latlng = event.latlng;
            callback({
                lat: latlng.lat,
                lng: latlng.lng,
                geohash: ngeohash.encode(latlng.lat, latlng.lng, 12)
            });
        }, 100);
    }
    
    getMapBounds() {
        const bounds = this.map.getBounds();
        const ne = bounds._northEast;
        const se = bounds._southWest;
        const center = bounds.getCenter();
        return {
            ne: {
                lat: ne.lat,
                lng: ne.lng,
                geohash: ngeohash.encode(ne.lat, ne.lng, 12)
            },
            sw: {
                lat: se.lat,
                lng: se.lng,
                geohash: ngeohash.encode(se.lat, se.lng, 12)
            },
            center: {
                lat: center.lat,
                lng: center.lng,
                geohash: ngeohash.encode(center.lat, center.lng, 12)
            }
        };
    }

    onViewMove(callback) {
        this.map.on('moveend', (event) => {
            callback(this.getMapBounds());
        }, 100);
    }
    
    onZoomChange(callback) {
        this.map.on('zoom resize', () => {
            callback(this.map.getZoom());
        });   
    }
    
    contourElementClickHandlers = [];
    
    onContourElementClick(callback) {
        this.contourElementClickHandlers.push(callback);
    }

    geohashClickClickHandlers = [];
    onGeohashClick(callback) {
        this.geohashClickClickHandlers.push(callback);
    }
    
    triggerContourElementClick() {
        const explorerMap = this;
        
        return function() {
            let contourEl = this;

            explorerMap.contourElementClickHandlers.forEach((callback) => {
                callback({
                    center: contourEl._latlng || contourEl.getCenter(),
                    spaceTokenId: contourEl.spaceTokenId,
                    contour: contourEl.contour,
                    contourKey: contourEl.contourKey,
                    spaceTokensIdsByContourKey: explorerMap.spaceTokensIdsByContourKey[contourEl.contourKey]
                });
            })
        };
    }
    
    drawPopup(latlng, text) {
        if(this.renderedPopup) {
            this.renderedPopup.remove();
            this.renderedPopup = null;
        }
        this.renderedPopup = L.popup()
            .setLatLng(latlng)
            .setContent(text)
            .addTo(this.map);
    }
}
