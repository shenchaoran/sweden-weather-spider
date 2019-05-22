import WeatherSpider from './controller/weather-spider'
import { SiteModel } from './models'
import * as schedule from 'node-schedule'

const weatherSpider = new WeatherSpider();

(async () => {
    try {
        const fetchData = async () => {
            console.log(`--------------Update at ${new Date()}--------------`)
            // const sites = await SiteModel.find()
            await weatherSpider.getSites()
            await weatherSpider.getAllSitesWeather()
        }
        await fetchData()
        // update every hour
        schedule.scheduleJob('0 0 * * * *', fetchData)
    }
    catch(e) {
        console.error('error: \n', e)
    }
})()