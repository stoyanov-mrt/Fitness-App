import { toCsv } from "./csv";

describe("toCsv", () => {
  const columns = [
    { key: "date" as const, header: "Date" },
    { key: "name" as const, header: "Name" },
    { key: "amount" as const, header: "Amount" },
  ];

  it("writes a header row followed by one row per item", () => {
    const csv = toCsv(
      [
        { date: "2026-01-01", name: "Banana", amount: 89 },
        { date: "2026-01-02", name: "Chicken", amount: 165 },
      ],
      columns
    );
    expect(csv).toBe(
      "Date,Name,Amount\r\n2026-01-01,Banana,89\r\n2026-01-02,Chicken,165"
    );
  });

  it("returns just the header row for an empty dataset", () => {
    expect(toCsv([], columns)).toBe("Date,Name,Amount");
  });

  it("quotes fields containing a comma, quote, or newline, doubling embedded quotes", () => {
    const csv = toCsv(
      [{ date: "2026-01-01", name: 'Rice, "fried"\nwith egg', amount: 200 }],
      columns
    );
    expect(csv).toBe('Date,Name,Amount\r\n2026-01-01,"Rice, ""fried""\nwith egg",200');
  });

  it("renders null/undefined values as an empty field", () => {
    const csv = toCsv([{ date: "2026-01-01", name: undefined, amount: null }], columns);
    expect(csv).toBe("Date,Name,Amount\r\n2026-01-01,,");
  });
});
