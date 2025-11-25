import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';
import { initWasm } from '@resvg/resvg-wasm';

// We need to load a font for Satori
// For this environment, we might need to fetch it or bundle it.
// To keep it simple, we'll try to fetch a Google Font.

const loadFont = async () => {
    const response = await fetch('https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf');
    return await response.arrayBuffer();
};

export async function generateMatchImage(matchDate: string, startTime: string | undefined, courtName: string, players: any[]) {
    const fontData = await loadFont();

    const svg = await satori(
        {
            type: 'div',
            props: {
                children: [
                    {
                        type: 'div',
                        props: {
                            children: `Match Full!`,
                            style: { fontSize: 40, fontWeight: 'bold', marginBottom: 20, color: '#22c55e' },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: `${matchDate} ${startTime ? 'at ' + startTime : ''}`,
                            style: { fontSize: 30, marginBottom: 10, color: '#fff' },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: courtName,
                            style: { fontSize: 24, marginBottom: 30, color: '#aaa' },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: players.map((p) => ({
                                type: 'div',
                                props: {
                                    children: `${p.player_name} (Lvl ${p.player_level || '?'})`,
                                    style: {
                                        padding: '10px 20px',
                                        background: '#333',
                                        borderRadius: 8,
                                        marginBottom: 10,
                                        color: '#fff',
                                        width: '100%',
                                        textAlign: 'center'
                                    },
                                },
                            })),
                            style: { display: 'flex', flexDirection: 'column', width: '100%', gap: 10 },
                        },
                    },
                ],
                style: {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1a1a1a',
                    padding: 40,
                },
            },
        },
        {
            width: 600,
            height: 600,
            fonts: [
                {
                    name: 'Roboto',
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                },
            ],
        }
    );

    // Initialize Wasm (only needs to be done once, but safe to call multiple times in some versions, 
    // or we check a global. For Cloudflare Workers, we might need to be careful. 
    // @resvg/resvg-wasm usually handles this or requires a specific setup.
    // Let's try standard init.
    try {
        await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
    } catch (e) {
        // Might already be initialized
    }

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 600,
        },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return pngBuffer;
}
