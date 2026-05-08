export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Hubungi Kami'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const getPrimaryImage = (images = []) => {
  if (!images || images.length === 0) return null
  return (
    images.find((img) => img.is_primary)?.url ||
    images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.url ||
    null
  )
}

export const WHATSAPP_NUMBERS = {
  jakarta:  '6281254388912',
  surabaya: '6281359522218',
}

export const getWhatsAppUrl = (number, message) =>
  `https://wa.me/${number}?text=${message}`

export const ORDER_STATUSES = {
  pending:    { label: 'Menunggu',    color: 'amber' },
  confirmed:  { label: 'Dikonfirmasi', color: 'blue' },
  processing: { label: 'Diproses',    color: 'purple' },
  shipped:    { label: 'Dikirim',     color: 'indigo' },
  completed:  { label: 'Selesai',     color: 'green' },
  cancelled:  { label: 'Dibatalkan',  color: 'red' },
}

export const ORDER_TYPES = {
  retail: {
    label: 'Retail',
    description: 'Pembelian satuan / eceran untuk kebutuhan pribadi atau renovasi kecil.',
  },
  project: {
    label: 'Project',
    description: 'Pembelian volume besar untuk proyek konstruksi, hotel, apartemen, dll. Harga dapat dinegosiasi.',
  },
  sample: {
    label: 'Sample',
    description: 'Permintaan contoh material sebelum pembelian. Biaya sample berlaku.',
  },
  konsultasi: {
    label: 'Konsultasi',
    description: 'Konsultasi desain interior atau pemilihan material bersama tim ahli kami.',
  },
}

export const ADMIN_REGIONS = [
  { key: 'jakarta',  label: 'Admin Jakarta',  number: WHATSAPP_NUMBERS.jakarta },
  { key: 'surabaya', label: 'Admin Surabaya', number: WHATSAPP_NUMBERS.surabaya },
]
