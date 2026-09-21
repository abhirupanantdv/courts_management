import json, os, csv

transcript_path = r"C:\Users\galac\.gemini\antigravity-ide\brain\dbf6f9a1-2fe2-4918-9b07-1a4e157f8cdf\.system_generated\logs\transcript_full.jsonl"
csv_content = None

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        if "Salesman wise POS Register" in line and '"POS Profile"' in line:
            data = json.loads(line)
            # Find the string containing "POS Profile"
            def find_str(obj):
                if isinstance(obj, str):
                    if '"POS Profile"' in obj:
                        return obj
                elif isinstance(obj, dict):
                    for v in obj.values():
                        res = find_str(v)
                        if res: return res
                elif isinstance(obj, list):
                    for v in obj:
                        res = find_str(v)
                        if res: return res
                return None
            val = find_str(data)
            if val:
                idx = val.find('"POS Profile"')
                if idx != -1:
                    csv_content = val[idx:]
                    break

if csv_content:
    print("Found CSV content, length:", len(csv_content))
    reader = csv.reader(csv_content.strip().splitlines())
    header = next(reader)
    print("Header:", header)
    records = []
    for r in reader:
        if not r or len(r) < 11:
            continue
        # Skip subtotal rows
        if not r[1].strip() or not r[2].strip():
            continue
        record = {
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
        }
        records.append(record)
    
    print(f"Parsed {len(records)} valid POS invoice transactions")
    
    # Write to JS file
    js_content = f"// Salesman wise POS Register live data from ERPNext\nexport const salesmanPosRegisterData = {json.dumps(records, indent=2)};\n"
    out_path = r"c:\Users\galac\OneDrive\Desktop\abhirup\Courts Management 2\Courts Management\src\data\salesmanPosRegisterData.js"
    with open(out_path, "w", encoding="utf-8") as out_f:
        out_f.write(js_content)
    print(f"Successfully wrote {out_path}")
else:
    print("CSV content not found!")
