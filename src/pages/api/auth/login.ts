import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { password } = data as { password: string };

        // Simple hardcoded password for prototype
        // In production, use env var or proper auth
        const ADMIN_PASSWORD = 'admin';

        if (password === ADMIN_PASSWORD) {
            cookies.set('admin_session', 'true', {
                path: '/',
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
