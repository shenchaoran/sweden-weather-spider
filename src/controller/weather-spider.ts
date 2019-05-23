import * as _ from 'lodash'
import * as requestAsync from 'request-promise'
import * as Bluebird from 'bluebird'
import { setting } from '../config/setting'
import * as path from 'path'
const fs = Bluebird.promisifyAll(require('fs'))
import { SiteModel, ISiteDocument, WeatherModel, IWeatherDocument } from '../models'
import { getMonth, getYear, getHours, getDate, addHours, format } from 'date-fns'
import * as Papa from 'papaparse'

export default class WeatherSpider {
    sites: ISiteDocument[] = []

    constructor() { }

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
                if (e.code === 11000) {

                }
                else {
                    console.error(e)
                }
            })
    }

    async getSitesBy() {
        
    }

    async getAllSitesWeather() {
        this.sites = await SiteModel.find()
        return Bluebird.map(this.sites, async site => {
            await this.getSiteWeather(site)
        }, { concurrency: 10 })
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
                _value: res,
                timeSeries: [],
            }
            delete doc._value.approvedTime
            delete doc._value.referenceTime
            const list = []
            const days = _.get(doc, '_value.daySerie')
            const referTime = addHours(new Date(doc.referenceTime), -8)
            const approvedTime = addHours(new Date(doc.approvedTime), -6)
            days.map(dayData => {
                dayData.data.map(hourData => {
                    // hourData.localDate = hourData.localDate.replace(/Z$/, '+01:00')
                    let localtime = addHours(new Date(hourData.localDate), -8)
                    // let weather
                    // let weatherN = _.get(hourData, 'Wsymb2')
                    // if(weatherN === '1') {
                    //     weather = '晴'
                    // }
                    // else if(weatherN === '2') {
                    //     weather = '多云'
                    // }
                    // else if(weatherN === '3') {
                    //     weather = '阴'
                    // }
                    // else if(weatherN === '2') {
                    //     weather = '多云'
                    // }
                    list.push({
                        'update time': format(approvedTime, 'YYYY-MM-DD HH:mm:ss'),
                        year: getYear(localtime),
                        month: getMonth(localtime) + 1,
                        day: getDate(localtime),
                        hour: getHours(localtime),
                        'day or night': _.get(hourData, 'timeOfDay'),
                        Wsymb2: _.get(hourData, 'Wsymb2'),
                        temperature: _.get(hourData, 't'),
                        precipitation: _.get(hourData, 'pit'),
                        'wind direction (degree)': _.get(hourData, 'wd'),
                        'wind speed (m/s)': _.get(hourData, 'ws'),
                        'sikt (km)': _.get(hourData, 'vis'),
                        'luftfukt': _.get(hourData, 'r'),
                        pressure: _.get(hourData, 'msl'),
                    })
                })
            })
            doc.timeSeries = list
            return WeatherModel.updateOne({
                geonameid: doc.geonameid,
                approvedTime: doc.approvedTime,
                referenceTime: doc.referenceTime,
            }, doc, { upsert: true })
                .then(v => {
                    const fname = `${_.get(res, 'place.place')}-updated-at-${format(approvedTime, 'YYYY-MM-DD-HH-mm-ss')}.csv`
                    let csv = Papa.unparse(list as any, {
                        skipEmptyLines: true
                    } as any)
                    return fs.writeFileAsync(path.join(setting.dataPath, fname), csv, 'utf8')
                })
                .then(() => {
                    console.log(`site updated: ${_.get(doc, '_value.place.place')}`)
                })
        })
            .catch(e => {
                if (e.code !== 11000) {
                    console.error(e)
                }
            })
    }
}