<?php

/** @var yii\web\View $this */
/** @var common\models\Bill $bill */
?>
<!DOCTYPE html>
<html>

<head>
    <title>Invoice #<?= $bill->id ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            color: #2c3e50;
        }

        .header p {
            margin: 2px 0;
            color: #7f8c8d;
        }

        .info {
            width: 100%;
            margin-bottom: 20px;
        }

        .info td {
            padding: 5px;
            vertical-align: top;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .table th {
            background-color: #34495e;
            color: white;
            padding: 8px;
            text-align: left;
        }

        .table td {
            border-bottom: 1px solid #ddd;
            padding: 8px;
        }

        .table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .total {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 10px;
            color: #7f8c8d;
        }

        .status-paid {
            color: green;
            font-weight: bold;
        }

        .status-partial {
            color: orange;
            font-weight: bold;
        }

        .status-unpaid {
            color: red;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>SIMRS Inovamedika</h1>
        <p>Jl. Kesehatan No. 123, Jakarta</p>
        <p>Telp: (021) 123-4567 | Email: info@inovamedika.com</p>
    </div>

    <table class="info">
        <tr>
            <td width="50%">
                <strong>Kepada:</strong><br>
                <?= $bill->visit->patient->full_name ?><br>
                No. RM: <?= $bill->visit->patient->medical_record_number ?><br>
                NIK: <?= $bill->visit->patient->nik ?>
            </td>
            <td width="50%" style="text-align: right;">
                <strong>Invoice #<?= str_pad($bill->id, 5, '0', STR_PAD_LEFT) ?></strong><br>
                Tanggal: <?= date('d M Y', strtotime($bill->created_at)) ?><br>
                Status: <span class="status-<?= $bill->status ?>"><?= strtoupper($bill->status) ?></span>
            </td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th>Deskripsi</th>
                <th width="20%" style="text-align: right;">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($bill->items as $item): ?>
                <tr>
                    <td><?= $item->description ?></td>
                    <td style="text-align: right;"><?= number_format($item->amount, 0, ',', '.') ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr>
                <td class="total">Total Tagihan:</td>
                <td class="total" style="text-align: right;">Rp <?= number_format($bill->total_amount, 0, ',', '.') ?></td>
            </tr>
            <tr>
                <td class="total">Sudah Dibayar:</td>
                <td class="total" style="text-align: right;">Rp <?= number_format($bill->paid_amount, 0, ',', '.') ?></td>
            </tr>
            <tr>
                <td class="total">Sisa Tagihan:</td>
                <td class="total" style="text-align: right; color: <?= $bill->total_amount - $bill->paid_amount > 0 ? 'red' : 'green' ?>;">
                    Rp <?= number_format($bill->total_amount - $bill->paid_amount, 0, ',', '.') ?>
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda kepada SIMRS Inovamedika.</p>
        <p>Invoice ini dicetak secara otomatis oleh sistem pada <?= date('d M Y H:i') ?>.</p>
    </div>
</body>

</html>