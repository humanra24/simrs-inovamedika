const axios = require("axios");
const pool = require("../config/database");

class LabService {
  static async getPendingOrders() {
    const result = await pool.query(`
            SELECT lo.id, lo.visit_id, lo.test_name, lo.status, lo.created_at,
                   p.full_name as patient_name
            FROM lab_orders lo
            JOIN visits v ON v.id = lo.visit_id
            JOIN patients p ON p.id = v.patient_id
            WHERE lo.status = 'pending'
            ORDER BY lo.created_at ASC
        `);
    return result.rows;
  }

  static async sendResult(orderId, data, token) {
    const response = await axios.post(
      `${process.env.YII_API_URL}/api/v1/lab/results/${orderId}`,
      data,
      { headers: { Authorization: token } },
    );
    return response.data;
  }
}

module.exports = LabService;
