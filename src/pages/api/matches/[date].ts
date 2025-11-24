import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
    const { date } = params;

    if (!date) {
        return new Response(JSON.stringify({ error: 'Missing date' }), { status: 400 });
    }

    try {
        const match = await locals.runtime.env.DB.prepare('SELECT * FROM matches WHERE date = ?').bind(date).first();

        if (!match) {
            return new Response(JSON.stringify({ error: 'Match day not found' }), { status: 404 });
        }

        const bookings = await locals.runtime.env.DB.prepare('SELECT * FROM bookings WHERE match_id = ?').bind(match.id).all();

        return new Response(JSON.stringify({ match, bookings: bookings.results }), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
