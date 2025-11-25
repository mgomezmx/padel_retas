
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const matches = await locals.runtime.env.DB.prepare('SELECT * FROM matches ORDER BY date DESC').all();
        return new Response(JSON.stringify(matches.results), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const { date, start_time, courts_count } = data as { date: string; start_time?: string; courts_count: number };

        if (!date || !courts_count) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const id = crypto.randomUUID();

        // Check if match exists for date, if so update it? For now just insert/replace
        // Using INSERT OR REPLACE to simplify "update" logic if ID is consistent, 
        // but here ID is random. Better to check existence or just rely on date unique constraint if we had one.
        // For this prototype, let's just insert. If date exists, we should probably update it.

        const existing = await locals.runtime.env.DB.prepare('SELECT id FROM matches WHERE date = ?').bind(date).first();

        if (existing) {
            await locals.runtime.env.DB.prepare(
                'UPDATE matches SET courts_count = ?, start_time = ? WHERE id = ?'
            ).bind(courts_count, start_time || null, existing.id).run();
            return new Response(JSON.stringify({ success: true, id: existing.id }), { status: 200 });
        } else {
            await locals.runtime.env.DB.prepare(
                'INSERT INTO matches (id, date, start_time, courts_count) VALUES (?, ?, ?, ?)'
            ).bind(id, date, start_time || null, courts_count).run();
            return new Response(JSON.stringify({ success: true, id }), { status: 201 });
        }

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
