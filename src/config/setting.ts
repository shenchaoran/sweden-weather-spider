import * as path from 'path'

export const setting = {
    mongodb: {
        name: 'SwedenWeather',
        host: '127.0.0.1',
        port: '27017'
    },
    dataPath: path.join(__dirname, '../data')
}