require('dotenv').config();
const axios = require('axios');

async function sendTemplateMessage() {
    try {
        const response = await axios({
            url: 'https://graph.facebook.com/v22.0/1063971673464877/messages',
            method: 'post',
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                messaging_product: 'whatsapp',
                to: '923102501142',
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
}

sendTemplateMessage();