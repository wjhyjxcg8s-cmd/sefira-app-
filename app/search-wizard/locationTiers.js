// Turkish-aware normalize — kept in sync with app/lib/locationData.ts's normalize().
// Duplicated (not imported) so this module stays a dependency-free CommonJS file that
// can be unit-tested directly with plain `node`, without a TS/JSX build step.
function normalize(s) {
  return (s || "")
    .replace(/İ/g, "I").replace(/ı/g, "i")
    .replace(/Ş/g, "S").replace(/ş/g, "s")
    .replace(/Ğ/g, "G").replace(/ğ/g, "g")
    .replace(/Ü/g, "U").replace(/ü/g, "u")
    .replace(/Ö/g, "O").replace(/ö/g, "o")
    .replace(/Ç/g, "C").replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Merges a flat listing array into priority tiers by location specificity:
 * tier1 = exact-ish neighborhood match, tier2 = district, tier3 = city, tier4 = country.
 * Each listing appears exactly once, in the highest tier it qualifies for.
 */
function tierByLocation(base, { city, district, neighborhood, countryCode }) {
  const selectedCityN = normalize(city);
  const selectedDistrictN = normalize(district);
  const selectedNeighborhoodN = normalize(neighborhood);
  const selectedCountryCodeN = (countryCode || "").toUpperCase();

  const tier1 = selectedNeighborhoodN
    ? base.filter((l) => normalize(l.neighborhood).includes(selectedNeighborhoodN))
    : [];
  const tier2 = selectedDistrictN
    ? base.filter((l) => !tier1.includes(l) && normalize(l.district).includes(selectedDistrictN))
    : [];
  const tier3 = base.filter(
    (l) => !tier1.includes(l) && !tier2.includes(l) && normalize(l.city).includes(selectedCityN)
  );
  const tier4 = base.filter(
    (l) =>
      !tier1.includes(l) &&
      !tier2.includes(l) &&
      !tier3.includes(l) &&
      (l.country_code || "").toUpperCase() === selectedCountryCodeN
  );

  return [...tier1, ...tier2, ...tier3, ...tier4];
}

module.exports = { normalize, tierByLocation };