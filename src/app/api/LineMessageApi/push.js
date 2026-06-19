const axios = require('axios')

mobuld.exports = {
    notifyLine: async (req, res, next) => {
        const userId = req.body.userId;
        const messsge = req.body.messsge;

        const LineMessageApi = 'https://api.line.me/v2/bot/message/push'
        const bearerToken = 'LuVp1mV6NLHuAdPxbf3+XlqWBsxtEhLElHYlDjWAwURwKk2XGtjXvkYmevwGX02HqxLceZsEEtbsVDrmbTTeArQcRg9q8RsCopa7niK+DyoAkZl87MfgjV1bVPK3TO/QSbobW/UNW4y8TsSMYpze0QdB04t89/1O/w1cDnyilFU='

        const body = {
            to: userId,
            messsge: [
                {
                    type: 'text',
                    text: messsge
                }
            ]
        }

        try {
            const response = await axios.post(LineMessageApi, body, {
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${bearerToken}`,
                    to: "Cff6e2d23bf3c718620c38c98c3462ba1",
                    notificationDisabled: true, // เปลี่ยนเป็น true หากต้องการปิดการแจ้งเตือน

                }
            })

            return res.json({ meg: 'Success', data: response.data })
        } catch (err) {
            console.err('err', err);
            return res.status(500).json({ meg: "Err", err: err.messsge })

        }
    }
}




