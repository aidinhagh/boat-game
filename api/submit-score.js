export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { won, reason, timeLeft } = request.body;
        
        // 1. Get Player IP (Vercel specific header)
        const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

        // 2. Prepare Telegram Message
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!botToken || !chatId) {
            console.error("Missing Environment Variables");
            return response.status(500).json({ message: 'Server Config Error' });
        }

        const statusIcon = won ? '🟢' : '🔴';
        const message = `
<b>Game Result:</b> ${statusIcon} ${won ? 'WIN' : 'LOSS'}
<b>Reason:</b> ${reason}
<b>Time Left:</b> ${timeLeft}s
<b>Player IP:</b> <code>${ip}</code>
        `;

        // 3. Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        return response.status(200).json({ success: true });

    } catch (error) {
        console.error("API Error:", error);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}