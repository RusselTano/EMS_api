import EventModel, { Event } from "../models/event.model.js";

export class EventService {
  async createEvent(eventData:Event) {
    // 🔍 Vérifier si l'événement existe déjà
    const existingEvent = await EventModel.findOne({ title: eventData.title });
    if (existingEvent) {
      throw new Error("Cet événement existe déjà");
    }

    // 🔍 Vérifier que la date est valide
    if (eventData.date && new Date(eventData.date) < new Date()) {
      throw new Error("La date doit être dans le futur");
    }

    // ✅ Créer l'événement
    return await EventModel.create(eventData);
  }
}
