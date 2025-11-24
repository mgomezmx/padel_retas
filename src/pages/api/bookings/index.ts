import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const { match_id, court_index, spot_index, player_name, player_token } = data as {
            match_id: string;
            court_index: number;
            spot_index: number;
            player_name: string;
            player_token: string;
        };

        if (!match_id || court_index === undefined || spot_index === undefined || !player_name || !player_token) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if spot is already taken
        const existing = await locals.runtime.env.DB.prepare(
            'SELECT id FROM bookings WHERE match_id = ? AND court_index = ? AND spot_index = ?'
        )
            .bind(match_id, court_index, spot_index)
            .first();

        if (existing) {
            return new Response(JSON.stringify({ error: 'Spot already taken' }), { status: 409 });
        }

        const id = crypto.randomUUID();
        const created_at = Date.now();

        await locals.runtime.env.DB.prepare(
            'INSERT INTO bookings (id, match_id, court_index, spot_index, player_name, player_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
            .bind(id, match_id, court_index, spot_index, player_name, player_token, created_at)
            .run();

        return new Response(JSON.stringify({ success: true, id }), { status: 201 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
    try {
        const data = await request.json();
        const { booking_id, player_token, admin_secret } = data as {
            booking_id: string;
            player_token?: string;
            admin_secret?: string;
        };

        if (!booking_id) {
            return new Response(JSON.stringify({ error: 'Missing booking_id' }), { status: 400 });
        }

        // In a real app, admin_secret should be an env var. For this demo, we'll assume a simple check or rely on player_token.
        // If admin_secret is provided (and valid - TODO), allow delete.
        // If player_token is provided, check if it matches the booking.

        const booking = await locals.runtime.env.DB.prepare('SELECT player_token FROM bookings WHERE id = ?').bind(booking_id).first();

        if (!booking) {
            return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
        }

        // Simple authorization check
        const isOwner = booking.player_token === player_token;
        const isAdmin = !!admin_secret; // Placeholder for admin check

        if (!isOwner && !isAdmin) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        await locals.runtime.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(booking_id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
