export function containsSQLInjection(obj) {
  const sqlPattern =
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b|\bUNION\b|--|#|;|'|"|`)/i;

  const checkValue = (val) => {
    if (typeof val === "string") return sqlPattern.test(val);
    if (typeof val === "object" && val !== null) return Object.values(val).some(checkValue);
    return false;
  };

  return checkValue(obj);
}
