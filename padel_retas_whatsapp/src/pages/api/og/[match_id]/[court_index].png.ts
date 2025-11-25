import type { APIRoute } from 'astro';
import { generateMatchImage } from '../../../../utils/generateImage';

export const GET: APIRoute = async ({ params, locals }) => {
    const { match_id, court_index } = params;

    if (!match_id || !court_index) {
        return new Response('Missing params', { status: 400 });
    }

    try {
        const match = await locals.runtime.env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(match_id).first();
        if (!match) return new Response('Match not found', { status: 404 });

        const bookings = await locals.runtime.env.DB.prepare(
            'SELECT * FROM bookings WHERE match_id = ? AND court_index = ?'
        ).bind(match_id, court_index).all();

        if (bookings.results.length === 0) return new Response('No bookings', { status: 404 });

        const pngBuffer = await generateMatchImage(
            match.date as string,
            match.start_time as string | undefined,
            `Court ${court_index}`,
            bookings.results
        );

        return new Response(new Blob([pngBuffer]), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            },
        });
    } catch (e) {
        console.error(e);
        return new Response('Error generating image', { status: 500 });
    }
};
