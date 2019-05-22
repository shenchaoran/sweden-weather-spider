import {  OgmsSchemaStatics, IOgmsModel } from './mongoose.base';
import { Document, Schema, Model, model } from 'mongoose';

const collectionName = 'Weather';
const schema = new Schema({
    geonameid: Number,
    approvedTime: String,
    referenceTime: String,
    _value: Schema.Types.Mixed,
}, { collection: collectionName });

schema.index(
    {geonameid: 1, approvedTime: 1, referenceTime: 1}, 
    {unique: true, background: true, dropDups: true},
)

Object.assign(schema.statics, OgmsSchemaStatics)
interface IWeatherModel extends Model<IWeatherDocument>, IOgmsModel {}
export const WeatherModel: IWeatherModel = model<IWeatherDocument, IWeatherModel>(collectionName, schema);

export interface IWeatherDocument extends Document {
    geonameid: Number;
    approvedTime: String;
    referenceTime: String;
    _value: Schema.Types.Mixed;
}