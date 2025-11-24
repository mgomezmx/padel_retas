
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const { date, courts_count } = data as { date: string; courts_count: number };

        if (!date || !courts_count) {
            return new Response(JSON.stringify({ error: 'Missing date or courts_count' }), { status: 400 });
        }

        const id = crypto.randomUUID();

        // Check if match day already exists
        const existing = await locals.runtime.env.DB.prepare('SELECT id FROM matches WHERE date = ?').bind(date).first();

        if (existing) {
            // Update existing
            await locals.runtime.env.DB.prepare('UPDATE matches SET courts_count = ? WHERE date = ?').bind(courts_count, date).run();
            return new Response(JSON.stringify({ success: true, id: existing.id, message: 'Updated existing match day' }), { status: 200 });
        }

        await locals.runtime.env.DB.prepare('INSERT INTO matches (id, date, courts_count) VALUES (?, ?, ?)')
            .bind(id, date, courts_count)
            .run();

        return new Response(JSON.stringify({ success: true, id }), { status: 201 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
