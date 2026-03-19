require('dotenv').config()
const axios = require('axios')

async function sendTemplateMessage()
{
    const response = await axios
    ({
        url: 'https://graph.facebook.com/v22.0/1063971673464877/messages',
        method: 'post',
        headers: 
        {
            Authorization:`Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify
        ({
            messaging_product: 'whatsapp',
            to: '923102501142', 
            type: 'template',
            template:
            {
                name: 'hello_world',
                language:
                {
                    code:'en_US'
                }
            }
        })
    })
    console.log("TOKEN:", process.env.WHATSAPP_TOKEN)
    console.log(response.data)
}
sendTemplateMessage()