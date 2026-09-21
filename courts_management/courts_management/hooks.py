app_name = "courts_management"
app_title = "Courts Management"
app_publisher = "Courts Management Team"
app_description = "Courts Management Command Centre - Live Enterprise Intelligence Dashboard"
app_email = "admin@courts.com"
app_license = "MIT"
app_version = "1.0.0"

# Website routing: Maps /courts to the standalone full-screen web portal
website_route_rules = [
    {"from_route": "/courts/<path:app_path>", "to_route": "courts"},
    {"from_route": "/courts", "to_route": "courts"},
]

# Ensure assets are served
app_include_js = []
app_include_css = []
