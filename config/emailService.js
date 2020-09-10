import nodemailer from "nodemailer"

export default class EmailService {

    _transporter;

    constructor() {
        this._transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL, pass: process.env.PASS } });
    }

    sendMail() {
        let options = {
            from: 'Articlone@noreply.com',
            to,
            subject,
            html: content
        }

        return new Promise(
            (resolve, reject) => {
                this._transporter.sendMail(options, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve("Message sent")
                    }
                })
            }
        )
    }
}