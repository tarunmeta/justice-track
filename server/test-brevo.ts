import * as SibApiV3Sdk from '@getbrevo/brevo';

async function test() {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // PASTE YOUR KEY HERE FOR LOCAL TEST
    const API_KEY = process.env.BREVO_API_KEY || 'YOUR_API_KEY_HERE';
    const SENDER_EMAIL = process.env.MAIL_FROM || 'YOUR_BREVO_SIGNUP_EMAIL';

    apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        API_KEY,
    );

    const email = new SibApiV3Sdk.SendSmtpEmail();
    email.sender = { email: SENDER_EMAIL, name: 'Brevo Test' };
    email.to = [{ email: 'tarunsainiwork@gmail.com' }];
    email.subject = 'Test OTP';
    email.htmlContent = '<h1>Your Test OTP: 123456</h1><p>If you see this, Brevo is working!</p>';

    console.log('--- Brevo Test Start ---');
    console.log('Using Sender:', SENDER_EMAIL);
    console.log('API Key present:', API_KEY !== 'YOUR_API_KEY_HERE' ? 'YES' : 'NO');

    try {
        const result = await apiInstance.sendTransacEmail(email);
        console.log('SUCCESS!');
        console.log('Message ID:', result.body.messageId);
    } catch (err: any) {
        console.error('FAILED with error:');
        console.error(JSON.stringify(err?.response?.body || err.message, null, 2));
        console.log('\nCommon Fix: Go to Brevo Dash -> Senders & Domains and verify your sender email.');
    }
}

test();
