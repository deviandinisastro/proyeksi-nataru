# -*- coding: utf-8 -*-
import codecs

def run():
    with codecs.open('assets/js/koridor.js', 'r', encoding='utf-8') as f:
        text = f.read()

    new_asdp = '''  // Tooltip gabungan 3 moda kendaraan - Lega, nyaman, dan berjarak proporsional
  const combinedAsdpHoverTexts = asdpData.map(d => {
    const total = d.proyeksi_total_2026 || (d.proyeksi_mobil_r4 + d.proyeksi_motor_r2 + d.proyeksi_truk_sumbu3);
    const pMobil = Math.round(((d.proyeksi_mobil_r4 || 0) / total) * 100);
    const pMotor = Math.round(((d.proyeksi_motor_r2 || 0) / total) * 100);
    const pTruk = Math.round(((d.proyeksi_truk_sumbu3 || 0) / total) * 100);

    let cleanTitle = d.lintas;
    let subtitle = '';
    if (cleanTitle.includes('Merak')) {
      cleanTitle = 'Merak – Bakauheni';
      subtitle = 'Lintas Selat Sunda';
    } else if (cleanTitle.includes('Ketapang')) {
      cleanTitle = 'Ketapang – Gilimanuk';
      subtitle = 'Lintas Selat Bali';
    } else {
      cleanTitle = 'Ciwandan & BBJ Bojonegara';
      subtitle = 'Pelabuhan Kontinjensi Truk';
    }

    return [
      `<span style="font-size:12px;font-weight:800;color:#FFFFFF;">${cleanTitle}</span><br>`,
      `<span style="font-size:10px;color:#94A3B8;">${subtitle}</span><br>`,
      `<br>`,
      `<span style="color:#38BDF8;font-size:12px;">●</span>  Mobil Pribadi (R4) :  <b>${formatNumber(d.proyeksi_mobil_r4)}</b> unit  <span style="color:#94A3B8;">(${pMobil}%)</span><br>`,
      `<span style="color:#FBBF24;font-size:12px;">●</span>  Sepeda Motor (R2) :  <b>${formatNumber(d.proyeksi_motor_r2)}</b> unit  <span style="color:#94A3B8;">(${pMotor}%)</span><br>`,
      `<span style="color:#C084FC;font-size:12px;">●</span>  Truk Logistik (S3+) :  <b>${formatNumber(d.proyeksi_truk_sumbu3)}</b> unit  <span style="color:#94A3B8;">(${pTruk}%)</span><br>`,
      `<br>`,
      `<span style="font-size:11px;font-weight:700;color:#F8FAFC;">Total Proyeksi :  ${formatNumber(total)} unit</span>`
    ].join('');
  });'''

    start_asdp = text.find('const combinedAsdpHoverTexts = asdpData.map')
    end_asdp = text.find('  const traceR4 = {', start_asdp)
    print('ASDP range:', start_asdp, end_asdp)
    if start_asdp != -1 and end_asdp != -1:
        text = text[:start_asdp] + new_asdp.strip() + '\n\n' + text[end_asdp:]
        print('ASDP replaced successfully!')

    new_tol = '''  // Tooltip gabungan 2 arah arus (Mudik & Balik) - Lega, nyaman, dan berjarak proporsional
  const combinedTolHoverTexts = gates.map((g, idx) => {
    const k = keluarValues[idx] || 0;
    const m = masukValues[idx] || 0;
    const tot = k + m;
    let cleanGate = g.key;
    let subtitle = '';
    if (cleanGate === 'Cikatama') {
      cleanGate = 'GT Cikampek Utama';
      subtitle = 'Koridor Trans Jawa';
    } else if (cleanGate === 'Kalitama') {
      cleanGate = 'GT Kalihurip Utama';
      subtitle = 'Koridor Cipularang / Bandung';
    } else if (cleanGate === 'Cikupa') {
      cleanGate = 'GT Cikupa';
      subtitle = 'Koridor Merak / Banten';
    } else {
      cleanGate = 'GT Ciawi';
      subtitle = 'Koridor Jagorawi / Puncak';
    }

    return [
      `<span style="font-size:12px;font-weight:800;color:#FFFFFF;">${cleanGate}</span><br>`,
      `<span style="font-size:10px;color:#94A3B8;">${subtitle}</span><br>`,
      `<br>`,
      `<span style="color:#38BDF8;font-size:12px;">●</span>  Keluar (Arus Mudik) :  <b>${formatNumber(k)}</b> unit<br>`,
      `<span style="color:#60A5FA;font-size:12px;">●</span>  Masuk (Arus Balik) :  <b>${formatNumber(m)}</b> unit<br>`,
      `<br>`,
      `<span style="font-size:11px;font-weight:700;color:#F8FAFC;">Total Arus Gerbang :  ${formatNumber(tot)} unit</span>`
    ].join('');
  });'''

    start_tol = text.find('const combinedTolHoverTexts = gates.map')
    end_tol = text.find('  const traceKeluar = {', start_tol)
    print('Tol range:', start_tol, end_tol)
    if start_tol != -1 and end_tol != -1:
        text = text[:start_tol] + new_tol.strip() + '\n\n' + text[end_tol:]
        print('Tol replaced successfully!')

    with codecs.open('assets/js/koridor.js', 'w', encoding='utf-8') as f:
        f.write(text)

    # Bump cache buster in index.html to 20261112_1045
    with codecs.open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    html = html.replace('?v=20261112_1040', '?v=20261112_1045')
    html = html.replace('?v=20261112_1030', '?v=20261112_1045')
    html = html.replace('?v=20261112_1020', '?v=20261112_1045')

    with codecs.open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print('✨ Sukses! Tooltip telah diperbarui dengan layout nyaman!')

if __name__ == '__main__':
    run()
