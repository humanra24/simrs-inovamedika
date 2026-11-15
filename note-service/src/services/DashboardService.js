const pool = require("../config/database");

class DashboardService {
  /**
   * Ringkasan: Total kunjungan, pendapatan, dan status pembayaran
   */
  static async getSummary(startDate, endDate) {
    const query = `
            SELECT 
                (SELECT COUNT(*) FROM visits WHERE visit_date BETWEEN $1 AND $2) as total_visits,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE created_at BETWEEN $1 AND $2) as total_revenue,
                (SELECT COALESCE(SUM(paid_amount), 0) FROM bills WHERE created_at BETWEEN $1 AND $2) as total_paid,
                (SELECT COUNT(*) FROM bills WHERE status = 'unpaid' AND created_at BETWEEN $1 AND $2) as unpaid_bills,
                (SELECT COUNT(*) FROM bills WHERE status = 'partial' AND created_at BETWEEN $1 AND $2) as partial_bills,
                (SELECT COUNT(*) FROM bills WHERE status = 'paid' AND created_at BETWEEN $1 AND $2) as paid_bills
        `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows[0];
  }

  /**
   * Kunjungan berdasarkan Poli
   */
  static async getVisitsByPolyclinic(startDate, endDate) {
    const query = `
            SELECT p.name as polyclinic_name, COUNT(v.id) as total_visits
            FROM polyclinics p
            LEFT JOIN visits v ON v.polyclinic_id = p.id AND v.visit_date BETWEEN $1 AND $2
            GROUP BY p.id, p.name
            ORDER BY total_visits DESC
        `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  /**
   * Jumlah Tindakan Medis
   */
  static async getActionsCount(startDate, endDate) {
    const query = `
            SELECT ma.name as action_name, COUNT(va.id) as total_performed
            FROM medical_actions ma
            LEFT JOIN visit_actions va ON va.medical_action_id = ma.id
            LEFT JOIN visits v ON v.id = va.visit_id AND v.visit_date BETWEEN $1 AND $2
            WHERE va.id IS NOT NULL
            GROUP BY ma.id, ma.name
            ORDER BY total_performed DESC
        `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  /**
   * Rekap Penggunaan Obat
   */
  static async getMedicineUsage(startDate, endDate) {
    const query = `
            SELECT m.name as medicine_name, SUM(pi.quantity) as total_used
            FROM medicines m
            JOIN prescription_items pi ON pi.medicine_id = m.id
            JOIN prescriptions pr ON pr.id = pi.prescription_id
            JOIN visits v ON v.id = pr.visit_id
            WHERE pr.status = 'dispensed' AND v.visit_date BETWEEN $1 AND $2
            GROUP BY m.id, m.name
            ORDER BY total_used DESC
        `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  /**
   * Detail Kunjungan per Poli (Drill-Down)
   */
  static async getVisitsDetail(polyclinic_id, startDate, endDate) {
    const query = `
            SELECT v.id, v.visit_date, v.queue_number, v.status,
                   p.full_name as patient_name, d.name as doctor_name, pc.name as polyclinic_name
            FROM visits v
            JOIN patients p ON p.id = v.patient_id
            JOIN doctors d ON d.id = v.doctor_id
            JOIN polyclinics pc ON pc.id = v.polyclinic_id
            WHERE v.visit_date BETWEEN $1 AND $2
              AND ($3::int IS NULL OR v.polyclinic_id = $3)
            ORDER BY v.visit_date DESC, v.queue_number ASC
        `;
    const res = await pool.query(query, [
      startDate,
      endDate,
      polyclinic_id || null,
    ]);
    return res.rows;
  }

  /**
   * Detail Tagihan (Drill-Down Status Pembayaran)
   */
  static async getBillsDetail(status, startDate, endDate) {
    const query = `
            SELECT b.id, b.total_amount, b.paid_amount, b.status, b.created_at,
                   p.full_name as patient_name, v.visit_date
            FROM bills b
            JOIN visits v ON v.id = b.visit_id
            JOIN patients p ON p.id = v.patient_id
            WHERE b.created_at BETWEEN $1 AND $2
              AND ($3::text IS NULL OR b.status = $3)
            ORDER BY b.created_at DESC
        `;
    const res = await pool.query(query, [startDate, endDate, status || null]);
    return res.rows;
  }
}

module.exports = DashboardService;
