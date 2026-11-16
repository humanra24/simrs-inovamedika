const pool = require("../config/database");

// Filter tanggal aman untuk kolom date maupun timestamp:
// awal <= kolom < (akhir + 1 hari), jadi hari terakhir ikut terhitung penuh.
const range = (col) =>
  `${col} >= $1::date AND ${col} < ($2::date + INTERVAL '1 day')`;

class DashboardService {
  /**
   * Ringkasan: total kunjungan, pendapatan, dan status pembayaran
   */
  static async getSummary(startDate, endDate) {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM visits WHERE ${range("visit_date")}) AS total_visits,
        COALESCE(SUM(b.paid_amount), 0)  AS total_revenue,
        COALESCE(SUM(b.total_amount), 0) AS total_billed,
        COUNT(*) FILTER (WHERE b.status = 'paid')    AS paid_bills,
        COUNT(*) FILTER (WHERE b.status = 'unpaid')  AS unpaid_bills,
        COUNT(*) FILTER (WHERE b.status = 'partial') AS partial_bills
      FROM bills b
      WHERE ${range("b.created_at")}
    `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows[0];
  }

  /**
   * Kunjungan berdasarkan Poli
   */
  static async getVisitsByPolyclinic(startDate, endDate) {
    const query = `
      SELECT p.id AS polyclinic_id, p.name AS polyclinic_name,
             COUNT(v.id) AS total_visits
      FROM polyclinics p
      LEFT JOIN visits v
        ON v.polyclinic_id = p.id AND ${range("v.visit_date")}
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
      SELECT ma.name AS action_name, COUNT(va.id) AS total_performed
      FROM visit_actions va
      JOIN medical_actions ma ON ma.id = va.medical_action_id
      JOIN visits v ON v.id = va.visit_id
      WHERE ${range("v.visit_date")}
      GROUP BY ma.id, ma.name
      ORDER BY total_performed DESC
      LIMIT 10
    `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  /**
   * Rekap Penggunaan Obat
   */
  static async getMedicineUsage(startDate, endDate) {
    const query = `
      SELECT m.name AS medicine_name, SUM(pi.quantity) AS total_used
      FROM prescription_items pi
      JOIN medicines m ON m.id = pi.medicine_id
      JOIN prescriptions pr ON pr.id = pi.prescription_id
      JOIN visits v ON v.id = pr.visit_id
      WHERE pr.status = 'dispensed' AND ${range("v.visit_date")}
      GROUP BY m.id, m.name
      ORDER BY total_used DESC
    `;
    const res = await pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  /**
   * Detail Kunjungan per Poli (drill-down)
   */
  static async getVisitsDetail(polyclinic_id, startDate, endDate) {
    const query = `
      SELECT v.id, v.visit_date, v.queue_number, v.status,
             p.full_name AS patient_name,
             COALESCE(d.name, '-') AS doctor_name,
             pc.name AS polyclinic_name
      FROM visits v
      JOIN patients p ON p.id = v.patient_id
      LEFT JOIN doctors d ON d.id = v.doctor_id
      JOIN polyclinics pc ON pc.id = v.polyclinic_id
      WHERE ${range("v.visit_date")}
        AND ($3::int IS NULL OR v.polyclinic_id = $3::int)
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
   * Detail Tagihan (drill-down status pembayaran)
   * Kartu "Belum Lunas" menghitung unpaid + partial, jadi detailnya sama.
   */
  static async getBillsDetail(status, startDate, endDate) {
    const statuses =
      status === "unpaid" ? ["unpaid", "partial"] : status ? [status] : null;

    const query = `
      SELECT b.id, b.total_amount, b.paid_amount, b.status, b.created_at,
             p.full_name AS patient_name, v.visit_date
      FROM bills b
      JOIN visits v ON v.id = b.visit_id
      JOIN patients p ON p.id = v.patient_id
      WHERE ${range("b.created_at")}
        AND ($3::text[] IS NULL OR b.status = ANY($3::text[]))
      ORDER BY b.created_at DESC
    `;
    const res = await pool.query(query, [startDate, endDate, statuses]);
    return res.rows;
  }
}

module.exports = DashboardService;
