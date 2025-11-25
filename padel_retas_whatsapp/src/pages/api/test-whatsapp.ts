import type { APIRoute } from 'astro';
import { sendWhatsAppNotification } from '../../utils/sendWhatsApp';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const env = locals.runtime.env;

        // Dummy data for test
        const matchId = 'test-match-id';
        const courtIndex = 1;
        const matchDate = 'Test Date';
        const startTime = '10:00 AM';

        // We need to ensure the image generation endpoint works for this dummy data too, 
        // or we might get a broken image link if the DB lookup fails in the OG endpoint.
        // But sendWhatsAppNotification constructs the URL. 
        // If we want to test the full flow including image, we need real data or a mocked OG endpoint.
        // For now, let's just test the Twilio sending part. 
        // The OG endpoint might 404 if we don't have the match in DB, but Twilio should still try to send the message text.

        await sendWhatsAppNotification(matchId, courtIndex, matchDate, startTime, env);

        return new Response('Check your WhatsApp! If you received a message, settings are correct. (Image might be missing if match not found in DB)', { status: 200 });
    } catch (e) {
        return new Response(`Error: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
    }
};
