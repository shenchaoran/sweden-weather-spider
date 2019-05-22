import {  OgmsSchemaStatics, IOgmsModel } from './mongoose.base';
import { Document, Schema, Model, model } from 'mongoose';

const collectionName = 'Sites';
const schema = new Schema({
    country: String,
    county: String,
    geonameid: Number,
    lat: Number,
    lon: Number,
    place: String,
    timezone: String,
    // zoomlevel: Number,
    district: String,
    municipality: String,
    population: Number,
}, { collection: collectionName });

schema.index({geonameid: 1}, {unique: true, background: true, dropDups: true})

Object.assign(schema.statics, OgmsSchemaStatics)
interface ISiteModel extends Model<ISiteDocument>, IOgmsModel {}
export const SiteModel: ISiteModel = model<ISiteDocument, ISiteModel>(collectionName, schema);

export interface ISiteDocument extends Document {
    country: String;
    county: String;
    geonameid: Number;
    lat: Number;
    lon: Number;
    place: String;
    timezone: String;
    // zoomlevel: Number;
    district: String;
    municipality: String;
    population: Number;
}