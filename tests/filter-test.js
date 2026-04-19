
const getStatusLocal = (stock) => {
  if (stock === 0) return "Out";
  if (stock <= 2) return "Critical";
  if (stock <= 5) return "Low";
  return "Healthy";
};

const products = [
  { name: "Milk", currentStock: 10, category: "Dairy", location: "Fridge" },
  { name: "Bread", currentStock: 2, category: "Bakery", location: "Counter" },
  { name: "Apple", currentStock: 0, category: null, location: null },
];

const testFilter = (selectedStatuses, selectedCategories, selectedLocations) => {
  return products.filter(p => {
    const status = getStatusLocal(p.currentStock);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(status);
    const matchesCategory = selectedCategories.length === 0 || 
                             (p.category && selectedCategories.includes(p.category)) ||
                             (!p.category && selectedCategories.includes("Uncategorized"));
    const matchesLocation = selectedLocations.length === 0 || 
                             (p.location && selectedLocations.includes(p.location)) ||
                             (!p.location && selectedLocations.includes("No Location"));
    return matchesStatus && matchesCategory && matchesLocation;
  });
};

console.log("Test Status (Healthy):", testFilter(["Healthy"], [], []).length === 1);
console.log("Test Status (Out):", testFilter(["Out"], [], []).length === 1);
console.log("Test Uncategorized:", testFilter([], ["Uncategorized"], []).length === 1);
console.log("Test No Location:", testFilter([], [], ["No Location"]).length === 1);
console.log("Test Multiple (Healthy + Dairy):", testFilter(["Healthy"], ["Dairy"], []).length === 1);

