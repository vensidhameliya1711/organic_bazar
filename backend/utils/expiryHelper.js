export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return { status: "fresh", daysLeft: null };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  // ✅ IMPORTANT FIX: remove time part
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // ✅ expired
  if (diffDays < 0) {
    return { status: "expired", daysLeft: 0 };
  }

  // ✅ expiring soon (within 3 days)
  if (diffDays <= 3) {
    return { status: "expiring", daysLeft: diffDays };
  }

  // ✅ fresh
  return { status: "fresh", daysLeft: diffDays };
};
