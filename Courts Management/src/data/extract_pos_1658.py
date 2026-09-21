import json, csv, os

transcript_path = r"C:\Users\galac\.gemini\antigravity-ide\brain\dbf6f9a1-2fe2-4918-9b07-1a4e157f8cdf\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

d = json.loads(lines[1658])
print("Step:", d.get("step_index"), "Source:", d.get("source"), "Type:", d.get("type"))
raw_txt = json.dumps(d)
needle = '"POS Profile"'
idx = raw_txt.find(needle)
if idx != -1:
    print("Found needle in line 1658!")
    # Parse string
    # Let's extract properly
    def find_val(obj):
        if isinstance(obj, str) and '"POS Profile"' in obj:
            return obj
        if isinstance(obj, dict):
            for v in obj.values():
                r = find_val(v)
                if r: return r
        if isinstance(obj, list):
            for v in obj:
                r = find_val(v)
                if r: return r
        return None

    csv_text = find_val(d)
    if csv_text:
        idx2 = csv_text.find('"POS Profile"')
        csv_data = csv_text[idx2:]
        reader = csv.reader(csv_data.strip().splitlines())
        header = next(reader)
        print("Header:", header)
        records = []
        for r in reader:
            if not r or len(r) < 11:
                continue
            if not r[1].strip() or not r[2].strip():
                continue
            try:
                records.append({
                    "pos_profile": r[0].strip(),
                    "posting_date": r[1].strip(),
                    "pos_invoice": r[2].strip(),
                    "customer": r[3].strip(),
                    "cashier": r[4].strip(),
                    "sales_person": r[5].strip() if r[5].strip() else "Direct Counter / Cashier",
                    "grand_total": float(r[6]),
                    "paid_amount": float(r[7]),
                    "payment_method": r[8].strip(),
                    "is_return": int(float(r[9])),
                    "company": r[10].strip(),
                })
            except Exception as ex:
                continue
        print(f"Successfully extracted {len(records)} transactions!")
        out_path = r"c:\Users\galac\OneDrive\Desktop\abhirup\Courts Management 2\Courts Management\src\data\salesmanPosRegisterData.js"
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write("// Live ERPNext Salesman wise POS Register Data\nexport const salesmanPosRegisterData = " + json.dumps(records, indent=2) + ";\n")
        print("Successfully generated salesmanPosRegisterData.js!")
else:
    print("Needle not found in line 1658")
