import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './db/schema.js';
import { eq, desc, asc, sql } from 'drizzle-orm';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection
const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for some Neon/Vercel environments
    }
});
const db = drizzle(client, { schema });

const MAX_SCHEDULES = 3000;

// --- API ROUTES ---

// Health Check / DB Status
app.get('/health', async (req, res) => {
    try {
        await db.execute(sql`SELECT 1`);
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Health check failed:', error);
        // Log connection string presence (safe)
        console.log('DB_URL exists?', !!process.env.DATABASE_URL);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        res.status(500).json({ status: 'error', database: 'disconnected', details: String(error) });
    }
});

// GET All Data (Initial Load)
app.get('/api/state', async (req, res) => {
    try {
        const allTechnicians = await db.query.technicians.findMany();
        const allServiceTypes = await db.query.serviceTypes.findMany();
        const allSchedules = await db.query.schedules.findMany({
            with: {
                boxes: {
                    with: {
                        services: true,
                    },
                    orderBy: asc(schema.boxes.number)
                }
            },
            orderBy: desc(schema.schedules.date) // Newest first
        });

        res.json({ technicians: allTechnicians, schedules: allSchedules, serviceTypes: allServiceTypes });
    } catch (error) {
        console.error('Error fetching state:', error);
        res.status(500).json({ error: 'Failed to fetch state' });
    }
});

// --- Technicians ---

app.post('/api/technicians', async (req, res) => {
    try {
        const { id, name } = req.body;
        await db.insert(schema.technicians).values({ id, name });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add technician' });
    }
});

app.delete('/api/technicians/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(schema.technicians).where(eq(schema.technicians.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete technician' });
    }
});

// --- Schedules ---

app.post('/api/schedules', async (req, res) => {
    try {
        const { id, date, shift, boxes } = req.body;

        // AUTO-CLEANUP: Check count before insert
        const countResult = await db.execute(sql`SELECT count(*) FROM ${schema.schedules}`);
        const count = parseInt(String(countResult.rows[0].count));

        if (count >= MAX_SCHEDULES) {
            console.log(`Limit reached (${count}).Deleting oldest schedule...`);
            // Get ID of oldest schedule
            const oldest = await db.query.schedules.findFirst({
                orderBy: asc(schema.schedules.date),
                columns: { id: true }
            });

            if (oldest) {
                // Cascade delete should handle boxes/services if configured in DB, 
                // but Drizzle standard delete might need manual cascade if FK constraints aren't set with ON DELETE CASCADE in raw SQL.
                // We defined references with onDelete: 'cascade' in schema, Drizzle Kit should generate that migration.
                await db.delete(schema.schedules).where(eq(schema.schedules.id, oldest.id));
            }
        }

        // Insert Schedule
        await db.insert(schema.schedules).values({ id, date, shift });

        // Insert Boxes
        for (const box of boxes) {
            await db.insert(schema.boxes).values({
                id: box.id,
                scheduleId: id,
                number: box.number,
                team: box.team || null,
                status: box.status,
                departureTime: box.departureTime,
                returnTime: box.returnTime
            });

            // Insert Services if any (usually empty on create, but good to handle)
            if (box.services && box.services.length > 0) {
                for (const service of box.services) {
                    await db.insert(schema.services).values({
                        id: service.id,
                        boxId: box.id,
                        osNumber: service.osNumber,
                        type: service.type,
                        status: service.status,
                        completedAt: service.completedAt
                    });
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

app.delete('/api/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(schema.schedules).where(eq(schema.schedules.id, id));
        // Cascade should handle the rest
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

app.put('/api/schedules/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        await db.update(schema.schedules).set({ notes }).where(eq(schema.schedules.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notes' });
    }
});

app.put('/api/schedules/:id/date', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        await db.update(schema.schedules).set({ date }).where(eq(schema.schedules.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update date' });
    }
});

// --- Boxes & Services Updates (Granular or Full Sync?) ---
// For simplicity and speed in migration, we can expose specific endpoints or a "Sync Schedule" endpoint.
// Given the granular actions in the store (updateBoxTeam, addService, etc.), specific endpoints are better for performance
// but require more boilerplate.
// Let's implement key granular updates.

// Boxes
app.post('/api/boxes', async (req, res) => {
    // Add Box logic
    const { scheduleId, box } = req.body;
    try {
        await db.insert(schema.boxes).values({
            id: box.id,
            scheduleId: scheduleId,
            number: box.number,
            team: box.team,
            status: box.status,
            departureTime: box.departureTime,
            returnTime: box.returnTime
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to add box' }); }
});

app.delete('/api/boxes/:id', async (req, res) => {
    try {
        await db.delete(schema.boxes).where(eq(schema.boxes.id, req.params.id));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to delete box' }); }
});

app.put('/api/boxes/:id', async (req, res) => {
    try {
        await db.update(schema.boxes).set(req.body).where(eq(schema.boxes.id, req.params.id));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to update box' }); }
});

// Services
app.post('/api/services', async (req, res) => {
    const { boxId, service } = req.body;
    try {
        await db.insert(schema.services).values({
            id: service.id,
            boxId,
            osNumber: service.osNumber,
            type: service.type,
            status: service.status,
            completedAt: service.completedAt
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to add service' }); }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await db.delete(schema.services).where(eq(schema.services.id, req.params.id));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to delete service' }); }
});

app.put('/api/services/:id', async (req, res) => {
    try {
        await db.update(schema.services).set(req.body).where(eq(schema.services.id, req.params.id));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to update service' }); }
});

// Move Service (Special Case)
app.post('/api/services/move', async (req, res) => {
    const { serviceId, toBoxId } = req.body;
    try {
        await db.update(schema.services).set({ boxId: toBoxId }).where(eq(schema.services.id, serviceId));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to move service' }); }
});

// --- Service Types (Dynamic Categories) ---

const DEFAULT_SERVICE_TYPES = [
    'ATIVAÇÃO', 'LINK-LOSS', 'LENTIDÃO', 'DYNGGASP', 'REANC-FIBRA',
    'T.FIBRA', 'T.EQUIPAMENTO', 'T.COMODO', 'T.ENDEREÇO',
    'T.EQUIPAMENTO+UPGRADE', 'T.COMODO+UPGRADE', 'T.ENDEREÇO+UPGRADE',
    'REPETIDO', 'REALOC-EQUIPAMENTO', 'REATIVAÇÃO', 'RETIRADA'
];

// Seed Service Types (Smart Sync - Add Only)
async function seedServiceTypes() {
    try {
        const existing = await db.query.serviceTypes.findMany();
        const existingNames = new Set(existing.map(t => t.name));

        // 1. Add missing types
        const toAdd = DEFAULT_SERVICE_TYPES.filter(name => !existingNames.has(name));
        if (toAdd.length > 0) {
            console.log(`Adding ${toAdd.length} new service types...`);
            for (const name of toAdd) {
                await db.insert(schema.serviceTypes).values({
                    id: Math.random().toString(36).substring(2, 9),
                    name: name
                });
            }
        }

        if (toAdd.length === 0) {
            console.log('Default service types are already present.');
        } else {
            console.log('Service types seeding complete.');
        }

    } catch (error) {
        console.error('Failed to sync service types:', error);
    }
}
// Run seeding slightly after startup to ensure DB connection
// Run seeding slightly after startup to ensure DB connection
setTimeout(seedServiceTypes, 2000);

const DEFAULT_TECHNICIANS = [
    'WESLEY', 'YURI', 'DANIEL', 'EVERTON', 'PEDRO',
    'SAMUEL', 'FELLIPE', 'BRUNO', 'MASTERSON', 'AILTON'
];

async function seedTechnicians() {
    try {
        const existing = await db.query.technicians.findMany();
        if (existing.length === 0) {
            console.log('Seeding technicians...');
            for (const name of DEFAULT_TECHNICIANS) {
                await db.insert(schema.technicians).values({
                    id: Math.random().toString(36).substring(2, 9),
                    name: name
                });
            }
            console.log('Technicians seeded.');
        }
    } catch (error) {
        console.error('Failed to seed technicians:', error);
    }
}
setTimeout(seedTechnicians, 2500);

app.get('/api/service-types', async (req, res) => {
    try {
        const types = await db.query.serviceTypes.findMany();
        res.json(types);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch service types' }); }
});

app.post('/api/service-types', async (req, res) => {
    try {
        const { id, name } = req.body;
        await db.insert(schema.serviceTypes).values({ id, name });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to add service type' }); }
});

app.delete('/api/service-types/:id', async (req, res) => {
    try {
        await db.delete(schema.serviceTypes).where(eq(schema.serviceTypes.id, req.params.id));
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed to delete service type' }); }
});


const PORT = process.env.PORT || 3000;

// Export app for Vercel
export default app;

// Only listen if not running in Vercel (Vercel manages the port/server)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
