var statistics = [
  {
    name: "Average time in clinic, Type A: ",
    location: { row: 5 + 3, col: 6 - 4 },
    cumulativeValue: 0,
    count: 0,
    rejected: 0,
  },
  {
    name: "Average time in clinic, Type B: ",
    location: { row: 5 + 4, col: 6 - 4 },
    cumulativeValue: 0,
    count: 0,
    rejected: 0,
  },
];

for (let i in statistics) {
  console.log(i + 1);
}