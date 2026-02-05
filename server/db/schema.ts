import { pgTable, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Global Technicians List
export const technicians = pgTable('technicians', {
    id: text('id').primaryKey(), // We'll keep using string IDs to match frontend logic or migrate to uuid
    name: text('name').notNull(),
});

// Schedules
export const schedules = pgTable('schedules', {
    id: text('id').primaryKey(),
    date: text('date').notNull(), // YYYY-MM-DD
    shift: text('shift').notNull(), // 'MANHÃ' | 'TARDE'
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Service Boxes
export const boxes = pgTable('boxes', {
    id: text('id').primaryKey(),
    scheduleId: text('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
    number: integer('number').notNull(),
    team: jsonb('team'), // Store { id, type, members: [{id, name}] }
    status: text('status'),
    departureTime: text('departure_time'),
    returnTime: text('return_time'),
    alert: text('alert'),
});

// Services
export const services = pgTable('services', {
    id: text('id').primaryKey(),
    boxId: text('box_id').references(() => boxes.id, { onDelete: 'cascade' }).notNull(),
    osNumber: text('os_number').notNull(),
    type: text('type').notNull(),
    status: text('status'), // 'pendente', 'concluido', etc.
    completedAt: text('completed_at'),
});

// Service Types
export const serviceTypes = pgTable('service_types', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
});

// Relations
export const schedulesRelations = relations(schedules, ({ many }) => ({
    boxes: many(boxes),
}));

export const boxesRelations = relations(boxes, ({ one, many }) => ({
    schedule: one(schedules, {
        fields: [boxes.scheduleId],
        references: [schedules.id],
    }),
    services: many(services),
}));

export const servicesRelations = relations(services, ({ one }) => ({
    box: one(boxes, {
        fields: [services.boxId],
        references: [boxes.id],
    }),
}));
