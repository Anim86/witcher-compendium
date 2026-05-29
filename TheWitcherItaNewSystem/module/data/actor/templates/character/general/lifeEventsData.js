import lifeEvent from "./lifeEventData.js";

const fields = foundry.data.fields;

export default function lifeEvents() {
    return {
        20:  new fields.SchemaField(lifeEvent(1)),
        30:  new fields.SchemaField(lifeEvent(2)),
        40:  new fields.SchemaField(lifeEvent(3)),
        50:  new fields.SchemaField(lifeEvent(4)),
        60:  new fields.SchemaField(lifeEvent(5)),
        70:  new fields.SchemaField(lifeEvent(6)),
        80:  new fields.SchemaField(lifeEvent(7)),
        90:  new fields.SchemaField(lifeEvent(8)),
        100:  new fields.SchemaField(lifeEvent(9)),
        110:  new fields.SchemaField(lifeEvent(10)),
        120:  new fields.SchemaField(lifeEvent(11)),
        130:  new fields.SchemaField(lifeEvent(12)),
        140:  new fields.SchemaField(lifeEvent(13)),
        150:  new fields.SchemaField(lifeEvent(14)),
        160:  new fields.SchemaField(lifeEvent(15)),
        170:  new fields.SchemaField(lifeEvent(16)),
        180:  new fields.SchemaField(lifeEvent(17)),
        190:  new fields.SchemaField(lifeEvent(18)),
        200:  new fields.SchemaField(lifeEvent(19)),
        
    }
  }