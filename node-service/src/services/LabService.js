const axios = require("axios");
const pool = require("../config/database");

class LabService {
  static async getOrders(status = null) {
    let query = `
    SELECT lo.id, lo.visit_id, lo.test_name, lo.status, lo.created_at,
           p.full_name as patient_name,
           p.medical_record_number,
           v.queue_number,
           pc.name as polyclinic_name,
           d.name as doctor_name
    FROM lab_orders lo
    JOIN visits v ON v.id = lo.visit_id
    JOIN patients p ON p.id = v.patient_id
    LEFT JOIN polyclinics pc ON pc.id = v.polyclinic_id
    LEFT JOIN doctors d ON d.id = v.doctor_id
  `;

    const params = [];
    if (status) {
      query += ` WHERE lo.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY lo.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getOrderById(orderId) {
    const query = `
    SELECT 
      lo.id, 
      lo.visit_id, 
      lo.test_name, 
      lo.status, 
      lo.created_at,
      lr.result_data, 
      lr.notes,
      p.full_name as patient_name,
      p.medical_record_number,
      v.queue_number,
      pc.name as polyclinic_name,
      d.name as doctor_name
    FROM lab_orders lo
    JOIN visits v ON v.id = lo.visit_id
    JOIN patients p ON p.id = v.patient_id
    LEFT JOIN polyclinics pc ON pc.id = v.polyclinic_id
    LEFT JOIN doctors d ON d.id = v.doctor_id
    LEFT JOIN lab_results lr ON lr.lab_order_id = lo.id
    WHERE lo.id = $1
  `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0] || null;
  }

  static async getOrdersByVisitId(visitId) {
    const query = `
    SELECT 
      lo.id, 
      lo.visit_id, 
      lo.test_name, 
      lo.status, 
      lo.created_at,
      lr.result_data, 
      lr.notes,
      p.full_name as patient_name,
      p.medical_record_number,
      v.queue_number,
      pc.name as polyclinic_name,
      d.name as doctor_name
    FROM lab_orders lo
    JOIN visits v ON v.id = lo.visit_id
    JOIN patients p ON p.id = v.patient_id
    LEFT JOIN polyclinics pc ON pc.id = v.polyclinic_id
    LEFT JOIN doctors d ON d.id = v.doctor_id
    LEFT JOIN lab_results lr ON lr.lab_order_id = lo.id
    WHERE lo.visit_id = $1
    ORDER BY lo.created_at DESC
  `;
    const result = await pool.query(query, [visitId]);
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
