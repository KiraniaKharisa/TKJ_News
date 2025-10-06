export function formatNumberLikes(num) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function potongText(text, panjang, akhiran = true) {
  if (text.length <= panjang) return text;

  if(akhiran) return text.substring(0, panjang) + "...";
  
  return text.substring(0, panjang);
}

export function hilangkanHTML(html) {
  
  let text = html.replace(/<script[\s\S]?>[\s\S]?<\/script>/gi, '')
                 .replace(/<style[\s\S]?>[\s\S]?<\/style>/gi, '');
  text = text.replace(/<(br|p|div)\s*\/?>/gi, '');
  text = text.replace(/<\/?[^>]+(>|$)/g, '');
  return text.replace(/\n{2,}/g, '\n').trim();
}

export const formatDateCreatedAt = (
  dateStr,
  options = { nameMonth: false, showDay: false }
) => {
  const d = new Date(dateStr);

  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = d.getDate().toString().padStart(2, "0");
  const monthNum = (d.getMonth() + 1).toString().padStart(2, "0");
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  const dayName = days[d.getDay()];

  let dateFormatted = "";

  if (options?.nameMonth) {
    dateFormatted = `${day} ${monthName} ${year}`;
  } else {
    dateFormatted = `${day}-${monthNum}-${year}`;
  }

  if (options?.showDay) {
    dateFormatted = `${dayName}, ${dateFormatted}`;
  }

  return dateFormatted;
};

export const canAccessMiddlewareRole = (title, role, akses) => {
  if (title.toLowerCase() == akses.toLowerCase() && role?.toLowerCase() != akses.toLowerCase()) return false;
  return true;
};

export const delayAwait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatWaktuLalu(createdAt) {
  const now = new Date();
  const target = new Date(createdAt); // langsung parse string ISO
  const diffMs = now.getTime() - target.getTime();

  if (diffMs < 0) return "Baru saja";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} tahun yang lalu`;
  if (diffMonths > 0) return `${diffMonths} bulan yang lalu`;
  if (diffDays > 0) return `${diffDays} hari yang lalu`;
  if (diffHours > 0) return `${diffHours} jam yang lalu`;
  if (diffMinutes > 0) return `${diffMinutes} menit yang lalu`;

  return `${diffSeconds} detik yang lalu`;
}