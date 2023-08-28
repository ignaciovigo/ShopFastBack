import config from '../config/config.js'
import mailer from 'nodemailer'

export default class MailingService {
  constructor () {
    this.client = mailer.createTransport({
      service: config.MAIL_SERVICE,
      port: 587,
      auth: {
        user: config.EMAIL,
        pass: config.NODEMAILER
      }
    })
  }

  async sendSimpleMail ({ from, to, subject, text, attachments = [] }) {
    const result = await this.client.sendMail({
      from,
      to,
      subject,
      text,
      attachments
    })
    return result
  }
}
