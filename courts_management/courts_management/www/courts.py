import frappe

no_cache = 1

def get_context(context):
    context.no_cache = 1
    context.show_sidebar = False
    csrf_token = ""
    try:
        csrf_token = frappe.sessions.get_csrf_token()
    except Exception:
        pass
    context.csrf_token = csrf_token
    return context
