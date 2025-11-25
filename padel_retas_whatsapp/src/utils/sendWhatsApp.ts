export async function sendWhatsAppNotification(
    matchId: string,
    courtIndex: number,
    matchDate: string,
    startTime: string | undefined,
    env: any
) {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const fromNumber = env.TWILIO_FROM_NUMBER; // e.g., 'whatsapp:+14155238886'
    const toNumber = env.WHATSAPP_TO_NUMBER;   // e.g., 'whatsapp:+1234567890'
    const workerUrl = env.WORKER_URL;          // e.g., 'https://padel-retas-whatsapp.pages.dev'

    if (!accountSid || !authToken || !fromNumber || !toNumber || !workerUrl) {
        console.warn('Missing Twilio configuration. Skipping WhatsApp notification.');
        return;
    }

    const imageUrl = `${workerUrl}/api/og/${matchId}/${courtIndex}.png`;
    const messageBody = `Court ${courtIndex} is full for ${matchDate}${startTime ? ' at ' + startTime : ''}!`;

    try {
        const body = new URLSearchParams();
        body.append('From', fromNumber);
        body.append('To', toNumber);
        body.append('Body', messageBody);
        body.append('MediaUrl', imageUrl);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Failed to send WhatsApp:', text);
        } else {
            console.log('WhatsApp notification sent successfully.');
        }
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
    }
}
