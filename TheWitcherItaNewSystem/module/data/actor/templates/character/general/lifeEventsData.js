import lifeEvent from "./lifeEventData.js";

const fields = foundry.data.fields;

export default function lifeEvents() {
    return new fields.TypedObjectField(new fields.SchemaField(lifeEvent()));
}
