import * as _ from 'lodash'
import * as requestAsync from 'request-promise'
import * as Bluebird from 'bluebird'
import { setting } from '../config/setting'
import * as path from 'path'
import { SiteModel, ISiteDocument, WeatherModel, IWeatherDocument } from '../models'

export default class WeatherSpider {
    sites: ISiteDocument[] = []
    
    constructor() {}

    async getSites() {
        const url = `https://www.smhi.se/wpt-a/backend_tendayforecast/bboxforecast/solr/50/0/70/40/9/4326`
        return requestAsync({
            url,
            method: 'GET',
            json: true,
        }).then(res => {
            const list = _.get(res, 'data')
            const sites = _.map(list, item => item.place)
            return SiteModel.insertMany(sites, { ordered: false })
        })
        .catch(e => {
            if(e.code === 11000) {

            }
            else {
                console.error(e)
            }
        })
    }

    async getAllSitesWeather() {
        this.sites = await SiteModel.find()
        return Bluebird.map(this.sites, async site => {
            await this.getSiteWeather(site)
        }, {concurrency: 10})
    }

    private async getSiteWeather(site) {
        const url = `https://www.smhi.se/wpt-a/backend_tendayforecast/forecast/fetcher/${site.geonameid}/10dFormat`
        return requestAsync({
            url,
            method: 'GET',
            json: true,
        }).then(res => {
            const doc = {
                geonameid: site.geonameid,
                approvedTime: res.approvedTime,
                referenceTime: res.referenceTime,
                _value: res
            }
            delete doc._value.approvedTime
            delete doc._value.referenceTime
            return WeatherModel.updateOne({
                geonameid: doc.geonameid,
                approvedTime: doc.approvedTime,
                referenceTime: doc.referenceTime,
            }, doc, { upsert: true} )
            .then(v => {
                console.log(`site updated: ${_.get(doc, '_value.place.place')}`)
            })
        })
        .catch(e => {
            if(e.code !== 11000) {
                console.error(e)
            }
        })
    }
}