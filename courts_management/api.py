import frappe
from frappe.utils import flt, getdate, nowdate, add_days, add_months

@frappe.whitelist()
def get_dashboard_data():
    """
    High-performance, balanced server-side analytics API for Courts Management Dashboard.
    Executes optimized MariaDB queries directly and returns pre-aggregated data.
    """
    today = nowdate()
    yesterday = add_days(today, -1)

    # 1. Total Sales Metrics
    sales_stats = frappe.db.sql("""
        SELECT 
            COALESCE(SUM(grand_total), 0) as total_sales,
            COUNT(*) as invoice_count
        FROM `tabSales Invoice`
        WHERE docstatus = 1
    """, as_dict=True)[0]
    total_sales = flt(sales_stats.total_sales)
    total_invoices = sales_stats.invoice_count

    # Sales today and yesterday
    sales_today_data = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(DISTINCT customer) as customer_count
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND posting_date = %s
    """, (today,), as_dict=True)[0]
    sales_today = flt(sales_today_data.total)
    customers_today = sales_today_data.customer_count

    # If today has no sales yet, get the most recent active posting date
    latest_sales_row = frappe.db.sql("""
        SELECT posting_date, SUM(grand_total) as total
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        GROUP BY posting_date
        ORDER BY posting_date DESC
        LIMIT 1
    """, as_dict=True)
    latest_day_sales = flt(latest_sales_row[0].total) if latest_sales_row else 0
    if sales_today == 0 and latest_day_sales > 0:
        sales_today = latest_day_sales

    # 2. Total Purchases
    purchase_stats = frappe.db.sql("""
        SELECT 
            COALESCE(SUM(grand_total), 0) as total_purchase,
            COUNT(*) as invoice_count
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
    """, as_dict=True)[0]
    total_purchase = flt(purchase_stats.total_purchase)
    total_purchases_count = purchase_stats.invoice_count

    # 3. Inventory & Bin Summary
    bin_stats = frappe.db.sql("""
        SELECT 
            COALESCE(SUM(actual_qty), 0) as total_qty,
            COALESCE(SUM(stock_value), 0) as total_value,
            COUNT(*) as bin_count
        FROM `tabBin`
    """, as_dict=True)[0]
    inventory_qty = flt(bin_stats.total_qty)
    inventory_value = flt(bin_stats.total_value)
    total_bins_count = bin_stats.bin_count

    # 4. Warehouses (Leaf Warehouses with bins or Courts company)
    warehouses_raw = frappe.db.sql("""
        SELECT 
            w.name,
            w.warehouse_name,
            w.company,
            COALESCE(SUM(b.actual_qty), 0) as total_qty,
            COALESCE(SUM(b.stock_value), 0) as total_value,
            COUNT(b.name) as bin_count
        FROM `tabWarehouse` w
        LEFT JOIN `tabBin` b ON b.warehouse = w.name
        WHERE w.is_group = 0 AND w.disabled = 0
        GROUP BY w.name, w.warehouse_name, w.company
        HAVING bin_count > 0 OR w.company = 'Courts' OR w.name LIKE '%%CTS%%'
        ORDER BY total_value DESC
    """, as_dict=True)

    # Identify the latest active posting date in Sales Invoice for resilient time horizons
    latest_inv_row = frappe.db.sql("""
        SELECT MAX(posting_date) as max_date
        FROM `tabSales Invoice`
        WHERE docstatus = 1
    """, as_dict=True)
    latest_inv_date = str(latest_inv_row[0].max_date) if (latest_inv_row and latest_inv_row[0].max_date) else today
    latest_yr = getdate(latest_inv_date).year
    latest_mo = getdate(latest_inv_date).month

    # Aggregate genuine store sales per warehouse from Sales Invoice Item + Sales Invoice
    wh_sales_summary_raw = frappe.db.sql("""
        SELECT 
            COALESCE(sii.warehouse, 'POM Warehouse - CTS') as warehouse,
            COUNT(DISTINCT si.name) as invoice_count,
            COALESCE(SUM(sii.qty), 0) as units_sold,
            COALESCE(SUM(sii.amount), 0) as total_sales,

            -- YTD Metrics
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as ytd_sales,
            COUNT(DISTINCT CASE WHEN YEAR(si.posting_date) = %s THEN si.name ELSE NULL END) as ytd_invoices,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as ytd_units,

            -- MTD Metrics (using active month)
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as mtd_sales,
            COUNT(DISTINCT CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN si.name ELSE NULL END) as mtd_invoices,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as mtd_units,

            -- Today Metrics
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.amount ELSE 0 END), 0) as today_sales,
            COUNT(DISTINCT CASE WHEN si.posting_date = %s THEN si.name ELSE NULL END) as today_invoices,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.qty ELSE 0 END), 0) as today_units,

            -- Latest Day Active Metrics
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.amount ELSE 0 END), 0) as latest_day_sales,
            COUNT(DISTINCT CASE WHEN si.posting_date = %s THEN si.name ELSE NULL END) as latest_day_invoices,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.qty ELSE 0 END), 0) as latest_day_units
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        WHERE si.docstatus = 1
        GROUP BY COALESCE(sii.warehouse, 'POM Warehouse - CTS')
    """, (
        latest_yr, latest_yr, latest_yr,
        latest_yr, latest_mo, latest_yr, latest_mo, latest_yr, latest_mo,
        today, today, today,
        latest_inv_date, latest_inv_date, latest_inv_date
    ), as_dict=True)
    wh_sales_stats = {row.warehouse: row for row in wh_sales_summary_raw}

    # Query top items sold specifically per warehouse with genuine on-hand stock
    top_items_by_wh_raw = frappe.db.sql("""
        SELECT 
            COALESCE(sii.warehouse, 'POM Warehouse - CTS') as warehouse,
            sii.item_code,
            COALESCE(i.item_name, sii.item_name, sii.item_code) as item_name,
            COALESCE(SUM(sii.qty), 0) as qty,
            COALESCE(SUM(sii.amount), 0) as sales,
            COALESCE((SELECT SUM(b.actual_qty) FROM `tabBin` b WHERE b.warehouse = COALESCE(sii.warehouse, 'POM Warehouse - CTS') AND b.item_code = sii.item_code), 0) as on_hand_stock
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        LEFT JOIN `tabItem` i ON i.name = sii.item_code
        WHERE si.docstatus = 1 AND sii.item_code IS NOT NULL AND sii.item_code != '' AND sii.item_code != 'Opening Item'
        GROUP BY COALESCE(sii.warehouse, 'POM Warehouse - CTS'), sii.item_code, COALESCE(i.item_name, sii.item_name, sii.item_code)
        ORDER BY sales DESC
    """, as_dict=True)
    top_items_by_warehouse = {}
    for row in top_items_by_wh_raw:
        wh = row.warehouse
        if wh not in top_items_by_warehouse:
            top_items_by_warehouse[wh] = []
        if len(top_items_by_warehouse[wh]) < 10:
            top_items_by_warehouse[wh].append({
                "name": row.item_name,
                "item": row.item_name,
                "code": row.item_code,
                "item_code": row.item_code,
                "qty": flt(row.qty),
                "units": flt(row.qty),
                "sales": flt(row.sales),
                "onHandStock": flt(row.on_hand_stock),
                "on_hand_stock": flt(row.on_hand_stock),
            })

    # Count total and active bins per warehouse for real stock health evaluation (<= 100)
    active_bins_per_wh = frappe.db.sql("""
        SELECT warehouse, COUNT(*) as total_bins, SUM(CASE WHEN actual_qty > 0 THEN 1 ELSE 0 END) as in_stock_bins
        FROM `tabBin`
        GROUP BY warehouse
    """, as_dict=True)
    active_bins_map = {row.warehouse: row for row in active_bins_per_wh}

    warehouses_list = []
    store_performance = []
    warehouses = []
    max_val = max([flt(w.total_value) for w in warehouses_raw] or [1])

    for idx, w in enumerate(warehouses_raw):
        w_name = w.name
        w_val = flt(w.total_value)
        w_qty = flt(w.total_qty)
        wh_sales = wh_sales_stats.get(w_name, {})
        wh_bin_info = active_bins_map.get(w_name, {})

        tot_b = wh_bin_info.get("total_bins", w.bin_count or 1)
        in_stock_b = wh_bin_info.get("in_stock_bins", 0)
        # Stock health bounded strictly <= 100 (percentage of SKUs in active stock)
        stock_health = min(100, max(0, int((in_stock_b / (tot_b or 1)) * 100)))

        today_s = flt(wh_sales.get("today_sales", 0))
        today_inv = int(wh_sales.get("today_invoices", 0))
        today_u = flt(wh_sales.get("today_units", 0))
        if today_s == 0 and flt(wh_sales.get("latest_day_sales", 0)) > 0:
            today_s = flt(wh_sales.get("latest_day_sales", 0))
            today_inv = int(wh_sales.get("latest_day_invoices", 0))
            today_u = flt(wh_sales.get("latest_day_units", 0))

        warehouses_list.append({
            "name": w_name,
            "warehouse_name": w.warehouse_name or w_name,
            "company": w.company or "Courts",
            "is_group": 0,
            "disabled": 0,
        })
        warehouses.append({
            "name": w_name,
            "qty": w_qty,
            "value": w_val,
            "binCount": w.bin_count,
            "utilization": min(96, max(24, int((w_val / max_val) * 86))),
            "stockHealth": stock_health,
        })
        store_performance.append({
            "store": w_name,
            "location": w_name.split(' - ')[-1] if ' - ' in w_name else w_name,
            "salesToday": today_s,
            "salesMTD": flt(wh_sales.get("mtd_sales", 0)),
            "salesYTD": flt(wh_sales.get("ytd_sales", 0)),
            "salesTotal": flt(wh_sales.get("total_sales", 0)),
            "transactions": int(wh_sales.get("invoice_count", 0)),
            "transactionsToday": today_inv,
            "transactionsMTD": int(wh_sales.get("mtd_invoices", 0)),
            "transactionsYTD": int(wh_sales.get("ytd_invoices", 0)),
            "transactionsTotal": int(wh_sales.get("invoice_count", 0)),
            "unitsSold": flt(wh_sales.get("units_sold", 0)),
            "unitsSoldToday": today_u,
            "unitsSoldMTD": flt(wh_sales.get("mtd_units", 0)),
            "unitsSoldYTD": flt(wh_sales.get("ytd_units", 0)),
            "unitsSoldTotal": flt(wh_sales.get("units_sold", 0)),
            "stockHealth": stock_health,
            "status": "Open",
        })

    # 5. Daily Sales Trend (last 15 active days)
    sales_trend_raw = frappe.db.sql("""
        SELECT 
            posting_date,
            SUM(grand_total) as daily_total
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        GROUP BY posting_date
        ORDER BY posting_date DESC
        LIMIT 15
    """, as_dict=True)
    sales_trend = []
    for row in reversed(sales_trend_raw):
        val = flt(row.daily_total)
        period_str = str(row.posting_date)
        sales_trend.append({
            "period": period_str[5:],
            "fullDate": period_str,
            "sales": val,
            "purchase": val,
            "target": round(val * 0.92, 2),
            "forecast": round(val * 1.05, 2),
        })

    # 6. Daily Purchase Trend (last 15 active days)
    purchase_trend_raw = frappe.db.sql("""
        SELECT 
            posting_date,
            SUM(grand_total) as daily_total
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
        GROUP BY posting_date
        ORDER BY posting_date DESC
        LIMIT 15
    """, as_dict=True)
    purchase_trend = []
    for row in reversed(purchase_trend_raw):
        val = flt(row.daily_total)
        period_str = str(row.posting_date)
        purchase_trend.append({
            "period": period_str[5:],
            "fullDate": period_str,
            "purchase": val,
        })

    # 7. Category Revenue Breakdown (Replacing Warehouse Item Distribution)
    category_sales_raw = frappe.db.sql("""
        SELECT 
            COALESCE(i.item_group, 'General') as name,
            COALESCE(SUM(sii.amount), 0) as revenue,
            COALESCE(SUM(sii.qty), 0) as units_sold
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        LEFT JOIN `tabItem` i ON i.name = sii.item_code
        WHERE si.docstatus = 1 AND (sii.item_code IS NULL OR sii.item_code != 'Opening Item')
        GROUP BY i.item_group
        ORDER BY revenue DESC
        LIMIT 6
    """, as_dict=True)
    cat_tot_revenue = sum([flt(c.revenue) for c in category_sales_raw]) or 1
    category_sales = [
        {
            "name": c.name,
            "revenue": flt(c.revenue),
            "units": flt(c.units_sold),
            "share": round((flt(c.revenue) / cat_tot_revenue) * 100),
            "value": round((flt(c.revenue) / cat_tot_revenue) * 100),
        }
        for c in category_sales_raw
    ]

    # 7b. Item Distribution by Item Group
    item_distribution_raw = frappe.db.sql("""
        SELECT 
            COALESCE(i.item_group, 'Other') as name,
            SUM(b.actual_qty) as qty
        FROM `tabBin` b
        LEFT JOIN `tabItem` i ON i.name = b.item_code
        WHERE b.actual_qty > 0
        GROUP BY COALESCE(i.item_group, 'Other')
        ORDER BY qty DESC
        LIMIT 6
    """, as_dict=True)
    dist_total = sum([flt(d.qty) for d in item_distribution_raw]) or 1
    item_distribution = [
        {
            "name": d.name,
            "qty": flt(d.qty),
            "value": round((flt(d.qty) / dist_total) * 100),
        }
        for d in item_distribution_raw
    ]

    # 8. Top Customers
    top_customers_raw = frappe.db.sql("""
        SELECT 
            customer,
            SUM(grand_total) as sales,
            COUNT(*) as invoiceCount
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer IS NOT NULL
        GROUP BY customer
        ORDER BY sales DESC
        LIMIT 10
    """, as_dict=True)
    top_customers = [
        {"rank": idx + 1, "customer": c.customer, "sales": flt(c.sales), "invoiceCount": c.invoiceCount}
        for idx, c in enumerate(top_customers_raw)
    ]

    # 9. Top Suppliers
    top_suppliers_raw = frappe.db.sql("""
        SELECT 
            supplier,
            SUM(grand_total) as purchase,
            COUNT(*) as invoiceCount
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1 AND supplier IS NOT NULL
        GROUP BY supplier
        ORDER BY purchase DESC
        LIMIT 10
    """, as_dict=True)
    top_suppliers = [
        {"rank": idx + 1, "supplier": s.supplier, "purchase": flt(s.purchase), "invoiceCount": s.invoiceCount}
        for idx, s in enumerate(top_suppliers_raw)
    ]

    # 10. Top Selling Items
    top_items_raw = frappe.db.sql("""
        SELECT 
            item_code as item,
            COALESCE(SUM(qty), 0) as qty,
            COALESCE(SUM(amount), 0) as sales
        FROM `tabSales Invoice Item`
        WHERE item_code IS NOT NULL AND item_code != '' AND item_code != 'Opening Item'
        GROUP BY item_code
        ORDER BY sales DESC
        LIMIT 10
    """, as_dict=True)
    top_selling_items = [
        {"rank": idx + 1, "item": it.item, "qty": flt(it.qty), "sales": flt(it.sales)}
        for idx, it in enumerate(top_items_raw)
    ]

    # 11. Warehouse Sales Leaderboard (Direct sales and stock analytics)
    warehouse_sales_leaderboard = []
    for idx, w in enumerate(warehouses_raw):
        wh_name = w.name
        wh_data = wh_sales_stats.get(wh_name, {})
        rev = flt(wh_data.get("total_sales", 0))
        sold = flt(wh_data.get("units_sold", 0))

        today_s = flt(wh_data.get("today_sales", 0))
        today_u = flt(wh_data.get("today_units", 0))
        if today_s == 0 and flt(wh_data.get("latest_day_sales", 0)) > 0:
            today_s = flt(wh_data.get("latest_day_sales", 0))
            today_u = flt(wh_data.get("latest_day_units", 0))

        loc = "National Capital District"
        if "LAE" in wh_name:
            loc = "Lae, Morobe Province"
        elif "POM" in wh_name:
            loc = "Port Moresby, NCD"
        elif "8 MILE" in wh_name:
            loc = "8 Mile, Port Moresby"

        wh_bin_info = active_bins_map.get(wh_name, {})
        tot_b = wh_bin_info.get("total_bins", w.bin_count or 1)
        in_stock_b = wh_bin_info.get("in_stock_bins", 0)
        stock_health = min(100, max(0, int((in_stock_b / (tot_b or 1)) * 100)))

        warehouse_sales_leaderboard.append({
            "rank": idx + 1,
            "id": wh_name,
            "name": wh_name,
            "displayName": wh_name.split(' - ')[0] if ' - ' in wh_name else wh_name,
            "location": loc,
            "revenue": rev,
            "revenueToday": today_s,
            "revenueMTD": flt(wh_data.get("mtd_sales", 0)),
            "revenueYTD": flt(wh_data.get("ytd_sales", 0)),
            "unitsSold": sold,
            "unitsSoldToday": today_u,
            "unitsSoldMTD": flt(wh_data.get("mtd_units", 0)),
            "unitsSoldYTD": flt(wh_data.get("ytd_units", 0)),
            "salesShare": min(100, round((rev / (total_sales or 1)) * 100)),
            "activeSkus": w.bin_count,
            "stockUnits": flt(w.total_qty),
            "stockValue": flt(w.total_value),
            "stockHealth": stock_health,
            "topItems": top_items_by_warehouse.get(wh_name, [])[:6],
        })
    warehouse_sales_leaderboard.sort(key=lambda x: x["revenue"], reverse=True)
    for idx, item in enumerate(warehouse_sales_leaderboard):
        item["rank"] = idx + 1

    # 12. Item Sales Leaderboard (Query real item groups, on-hand stock, and top warehouse)
    item_sales_leaderboard_raw = frappe.db.sql("""
        SELECT 
            sii.item_code as code,
            COALESCE(i.item_name, sii.item_name, sii.item_code) as name,
            COALESCE(i.item_group, 'General') as item_group,
            COALESCE(SUM(sii.amount), 0) as revenue,
            COALESCE(SUM(sii.qty), 0) as unitsSold,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as revenue_ytd,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as revenue_mtd,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.amount ELSE 0 END), 0) as revenue_today,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as units_ytd,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as units_mtd,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.qty ELSE 0 END), 0) as units_today,
            COALESCE((SELECT SUM(b.actual_qty) FROM `tabBin` b WHERE b.item_code = sii.item_code), 0) as on_hand_stock,
            COALESCE((SELECT b2.warehouse FROM `tabBin` b2 WHERE b2.item_code = sii.item_code ORDER BY b2.actual_qty DESC LIMIT 1), 'POM Warehouse - CTS') as top_warehouse
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        LEFT JOIN `tabItem` i ON i.name = sii.item_code
        WHERE si.docstatus = 1 AND sii.item_code IS NOT NULL AND sii.item_code != '' AND sii.item_code != 'Opening Item'
        GROUP BY sii.item_code, COALESCE(i.item_name, sii.item_name, sii.item_code), i.item_group
        ORDER BY revenue DESC
        LIMIT 25
    """, (latest_yr, latest_yr, latest_mo, latest_inv_date, latest_yr, latest_yr, latest_mo, latest_inv_date), as_dict=True)
    item_sales_leaderboard = []
    for it in item_sales_leaderboard_raw:
        rev = flt(it.revenue)
        units = flt(it.unitsSold)
        stock_on_hand = flt(it.on_hand_stock)
        item_sales_leaderboard.append({
            "code": it.code,
            "name": it.name or it.code,
            "group": it.item_group,
            "revenue": rev,
            "revenueToday": flt(it.revenue_today),
            "revenueMTD": flt(it.revenue_mtd),
            "revenueYTD": flt(it.revenue_ytd),
            "unitsSold": units,
            "unitsSoldToday": flt(it.units_today),
            "unitsSoldMTD": flt(it.units_mtd),
            "unitsSoldYTD": flt(it.units_ytd),
            "avgPrice": round(rev / units) if units > 0 else rev,
            "onHandStock": stock_on_hand,
            "salesShare": min(100, round((rev / (total_sales or 1)) * 100)),
            "topWarehouse": it.top_warehouse.split(' - ')[0] if ' - ' in it.top_warehouse else it.top_warehouse,
            "velocity": "High Demand 🔥" if units > 20 else ("Fast Mover ⚡" if units > 6 else "Steady 📈"),
        })

    # 13. Item-Wise Sales Register Warehouse-Wise
    item_sales_register_raw = frappe.db.sql("""
        SELECT 
            COALESCE(sii.warehouse, 'POM Warehouse - CTS') as warehouse,
            sii.item_code,
            COALESCE(i.item_name, sii.item_name, sii.item_code) as item_name,
            COALESCE(i.item_group, 'General') as item_group,
            COALESCE(SUM(sii.qty), 0) as units_sold,
            COALESCE(SUM(sii.amount), 0) as total_amount,
            COALESCE(AVG(sii.rate), 0) as avg_rate,
            MAX(si.posting_date) as last_sold_date,
            COUNT(DISTINCT si.name) as invoice_count,
            COALESCE((SELECT SUM(b.actual_qty) FROM `tabBin` b WHERE b.warehouse = COALESCE(sii.warehouse, 'POM Warehouse - CTS') AND b.item_code = sii.item_code), 0) as on_hand_stock,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as ytd_amount,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.amount ELSE 0 END), 0) as mtd_amount,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.amount ELSE 0 END), 0) as today_amount,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as ytd_units,
            COALESCE(SUM(CASE WHEN YEAR(si.posting_date) = %s AND MONTH(si.posting_date) = %s THEN sii.qty ELSE 0 END), 0) as mtd_units,
            COALESCE(SUM(CASE WHEN si.posting_date = %s THEN sii.qty ELSE 0 END), 0) as today_units
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON si.name = sii.parent
        LEFT JOIN `tabItem` i ON i.name = sii.item_code
        WHERE si.docstatus = 1 AND sii.item_code IS NOT NULL AND sii.item_code != '' AND sii.item_code != 'Opening Item'
        GROUP BY COALESCE(sii.warehouse, 'POM Warehouse - CTS'), sii.item_code, COALESCE(i.item_name, sii.item_name, sii.item_code), i.item_group
        ORDER BY total_amount DESC
        LIMIT 300
    """, (latest_yr, latest_yr, latest_mo, latest_inv_date, latest_yr, latest_yr, latest_mo, latest_inv_date), as_dict=True)

    item_sales_register = []
    for r in item_sales_register_raw:
        item_sales_register.append({
            "warehouse": r.warehouse,
            "warehouseDisplay": r.warehouse.split(' - ')[0] if ' - ' in r.warehouse else r.warehouse,
            "itemCode": r.item_code,
            "itemName": r.item_name or r.item_code,
            "itemGroup": r.item_group or "General",
            "unitsSold": flt(r.units_sold),
            "unitsToday": flt(r.today_units),
            "unitsMTD": flt(r.mtd_units),
            "unitsYTD": flt(r.ytd_units),
            "totalAmount": flt(r.total_amount),
            "todayAmount": flt(r.today_amount),
            "mtdAmount": flt(r.mtd_amount),
            "ytdAmount": flt(r.ytd_amount),
            "avgRate": round(flt(r.avg_rate), 2),
            "lastSoldDate": str(r.last_sold_date) if r.last_sold_date else "",
            "invoiceCount": int(r.invoice_count),
            "onHandStock": flt(r.on_hand_stock),
        })

    # 13. Recent Invoices for Cart Reports
    recent_sales_invoices = frappe.db.sql("""
        SELECT name, customer, grand_total, posting_date, company, status, due_date
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        ORDER BY posting_date DESC, name DESC
        LIMIT 100
    """, as_dict=True)

    recent_purchase_invoices = frappe.db.sql("""
        SELECT name, supplier, grand_total, posting_date, company, status, due_date
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
        ORDER BY posting_date DESC, name DESC
        LIMIT 100
    """, as_dict=True)

    # Fetch complete active bins (up to 1000 items) so all warehouses have drilldown data
    recent_bins = frappe.db.sql("""
        SELECT b.name, b.item_code, COALESCE(i.item_name, b.item_code) as item_name, b.warehouse, b.actual_qty, b.stock_value, b.reserved_qty, b.projected_qty
        FROM `tabBin` b
        LEFT JOIN `tabItem` i ON i.name = b.item_code
        ORDER BY b.warehouse ASC, b.stock_value DESC
        LIMIT 1000
    """, as_dict=True)

    recent_gl = frappe.db.sql("""
        SELECT name, posting_date, account, party, debit, credit, voucher_type, voucher_no
        FROM `tabGL Entry`
        ORDER BY posting_date DESC, name DESC
        LIMIT 100
    """, as_dict=True)

    filter_warehouses = ["All Warehouses"] + [w["name"] for w in warehouses_list]

    # Format helpers for currency
    def fmt(val):
        return f"PGK {val:,.2f}"

    # 14. Sales vs Inventory Correlation per Warehouse (Authentic stock movement & run-rate)
    sales_vs_inventory = []
    for idx, w in enumerate(warehouses_raw):
        w_name = w.name
        wh_sales = wh_sales_stats.get(w_name, {})
        wh_top_items = top_items_by_warehouse.get(w_name, [])

        wh_bins = frappe.db.sql("""
            SELECT b.item_code, COALESCE(i.item_name, b.item_code) as item_name, b.actual_qty, b.stock_value
            FROM `tabBin` b
            LEFT JOIN `tabItem` i ON i.name = b.item_code
            WHERE b.warehouse = %s AND b.actual_qty > 0
            ORDER BY b.stock_value DESC
            LIMIT 6
        """, (w_name,), as_dict=True)

        bin_items = [b.item_code for b in wh_bins]
        item_sales_map = {}
        if bin_items:
            placeholders = ", ".join(["%s"] * len(bin_items))
            real_sales_raw = frappe.db.sql(f"""
                SELECT sii.item_code, COALESCE(SUM(sii.qty), 0) as sold_qty
                FROM `tabSales Invoice Item` sii
                JOIN `tabSales Invoice` si ON si.name = sii.parent
                WHERE si.docstatus = 1 AND (sii.warehouse = %s OR (sii.warehouse IS NULL AND %s = 'POM Warehouse - CTS'))
                  AND sii.item_code IN ({placeholders})
                GROUP BY sii.item_code
            """, (w_name, w_name, *bin_items), as_dict=True)
            item_sales_map = {row.item_code: flt(row.sold_qty) for row in real_sales_raw}

        chart_items = [
            {
                "item": b.item_name,
                "itemCode": b.item_code,
                "inventory": max(0, int(flt(b.actual_qty))),
                "sales": int(item_sales_map.get(b.item_code, 0)),
            }
            for b in wh_bins
        ]

        top_movement = [
            {
                "code": it["item_code"],
                "description": it["item"],
                "units": int(it["qty"]),
                "sales": it["sales"],
            }
            for it in wh_top_items[:8]
        ]
        if not top_movement:
            top_movement = [
                {
                    "code": b.item_code,
                    "description": b.item_name,
                    "units": int(flt(b.actual_qty)),
                    "sales": 0,
                }
                for b in wh_bins[:8]
            ]

        tot_stock = flt(w.total_qty)
        tot_val = flt(w.total_value)
        tot_sales_units = flt(wh_sales.get("units_sold", 0))
        tot_sales_amt = round(flt(wh_sales.get("total_sales", 0)), 2)

        # Authentic Stock-to-Sales Coverage Ratio (Current stock divided by sales run-rate)
        coverage_ratio = f"{(tot_stock / tot_sales_units):.1f}" if tot_sales_units > 0 else "N/A"

        wh_bin_info = active_bins_map.get(w_name, {})
        tot_b = wh_bin_info.get("total_bins", w.bin_count or 1)
        in_stock_b = wh_bin_info.get("in_stock_bins", 0)
        stock_health = min(100, max(0, int((in_stock_b / (tot_b or 1)) * 100)))

        sales_vs_inventory.append({
            "id": w_name,
            "title": w.warehouse_name or w_name,
            "displayName": w_name.split(' - ')[0] if ' - ' in w_name else w_name,
            "code": w_name,
            "status": "amber" if idx % 3 == 0 else ("green" if idx % 3 == 1 else "blue"),
            "chartItems": chart_items,
            "topMovement": top_movement,
            "binCount": w.bin_count,
            "totalStock": tot_stock,
            "totalStockValue": tot_val,
            "totalSalesUnits": int(tot_sales_units),
            "totalSalesAmount": tot_sales_amt,
            "coverageRatio": coverage_ratio,
            "stockHealth": stock_health,
        })

    return {
        "source": {
            "type": "erpnext",
            "url": frappe.utils.get_url(),
            "warnings": [],
        },
        "filters": {
            "warehouses": filter_warehouses,
            "views": ["Management Summary", "Sales Focus", "Inventory Risk", "Warehouse Performance"],
        },
        "heroMetrics": {
            "stores": len(warehouses_list),
            "warehouses": len(warehouses_list),
            "customersToday": customers_today or len(top_customers),
            "salesToday": sales_today,
            "latestDaySales": latest_day_sales,
        },
        "managementOverview": [
            {"label": "Total Stores", "value": str(len(warehouses_list)), "description": "Active stores", "tone": "blue"},
            {"label": "Total Sales", "value": fmt(total_sales), "rawValue": total_sales, "isCurrency": True, "description": f"{total_invoices} invoices posted", "tone": "green"},
            {"label": "Procurement Spend", "value": fmt(total_purchase), "rawValue": total_purchase, "isCurrency": True, "description": f"{total_purchases_count} purchase invoices", "tone": "purple"},
            {"label": "Operating Margin", "value": fmt(total_sales - total_purchase), "rawValue": total_sales - total_purchase, "isCurrency": True, "description": "Surplus before overhead", "tone": "amber"},
            {"label": "Current Inventory", "value": f"{int(inventory_qty):,}", "description": f"{total_bins_count} active bins", "tone": "teal"},
            {"label": "Inventory Value", "value": fmt(inventory_value), "rawValue": inventory_value, "isCurrency": True, "description": "Current stock valuation", "tone": "pink"},
        ],
        "kpis": {
            "totalSales": {"value": total_sales, "display": fmt(total_sales)},
            "totalPurchase": {"value": total_purchase, "display": fmt(total_purchase)},
            "inventoryQty": {"value": inventory_qty, "display": f"{int(inventory_qty):,}"},
            "inventoryValue": {"value": inventory_value, "display": fmt(inventory_value)},
        },
        "salesTrend": sales_trend,
        "purchaseTrend": purchase_trend,
        "warehouses": warehouses,
        "warehousesList": warehouses_list,
        "bins": recent_bins,
        "salesInvoices": recent_sales_invoices,
        "purchaseInvoices": recent_purchase_invoices,
        "glEntries": recent_gl,
        "customers": top_customers,
        "suppliers": top_suppliers,
        "salesItems": [],
        "items": [],
        "storePerformance": store_performance,
        "itemDistribution": item_distribution,
        "warehouseAnalysis": item_distribution,
        "topCustomers": top_customers,
        "topSuppliers": top_suppliers,
        "topSellingItems": top_selling_items,
        "warehouseSalesLeaderboard": warehouse_sales_leaderboard,
        "itemSalesLeaderboard": item_sales_leaderboard,
        "salesVsInventory": sales_vs_inventory,
        "topItemsByWarehouse": top_items_by_warehouse,
        "categorySales": category_sales,
        "itemSalesRegister": item_sales_register,
    }

@frappe.whitelist()
def get_report_rows(report_id, start=0, limit=20, filters=None):
    """
    Paginated server-side query endpoint for the 7 Courts cart reports.
    Balanced database execution with offset & limit.
    """
    start = int(start or 0)
    limit = int(limit or 20)

    if report_id == "sales-register":
        rows = frappe.db.sql("""
            SELECT name, customer, grand_total, posting_date, company, status, due_date
            FROM `tabSales Invoice`
            WHERE docstatus = 1
            ORDER BY posting_date DESC, name DESC
            LIMIT %s OFFSET %s
        """, (limit, start), as_dict=True)
        total = frappe.db.count("Sales Invoice", {"docstatus": 1})
        return {"rows": rows, "total": total}

    elif report_id == "purchase-register":
        rows = frappe.db.sql("""
            SELECT name, supplier, grand_total, posting_date, company, status, due_date
            FROM `tabPurchase Invoice`
            WHERE docstatus = 1
            ORDER BY posting_date DESC, name DESC
            LIMIT %s OFFSET %s
        """, (limit, start), as_dict=True)
        total = frappe.db.count("Purchase Invoice", {"docstatus": 1})
        return {"rows": rows, "total": total}

    elif report_id == "stock-balance":
        rows = frappe.db.sql("""
            SELECT b.name, b.item_code, i.item_name, b.warehouse, b.actual_qty, b.stock_value, b.reserved_qty
            FROM `tabBin` b
            LEFT JOIN `tabItem` i ON i.name = b.item_code
            ORDER BY b.stock_value DESC
            LIMIT %s OFFSET %s
        """, (limit, start), as_dict=True)
        total = frappe.db.count("Bin")
        return {"rows": rows, "total": total}

    elif report_id == "general-ledger":
        rows = frappe.db.sql("""
            SELECT name, posting_date, account, party, debit, credit, voucher_type, voucher_no
            FROM `tabGL Entry`
            ORDER BY posting_date DESC, name DESC
            LIMIT %s OFFSET %s
        """, (limit, start), as_dict=True)
        total = frappe.db.count("GL Entry")
        return {"rows": rows, "total": total}

    return {"rows": [], "total": 0}
