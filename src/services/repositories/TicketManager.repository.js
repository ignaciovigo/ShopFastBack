
export default class TicketManagerRepository {
  constructor (dao) {
    this.dao = dao
  }

  async generate ({ email, amount, products, address }) {
    const ticket = await this.dao.generate({ email, amount, products, address })
    return ticket
  }

  async getById ({ ticketId }) {
    const ticket = await this.dao.getById({ ticketId })
    return ticket
  }

  async getTickets ({ email, page }) {
    const ticket = await this.dao.getTickets({ email, page })
    return ticket
  }
}
