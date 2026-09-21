frappe.pages['courts-dashboard'].on_page_load = function(wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: 'Courts Command Centre',
    single_column: true
  });

  // Render seamless full-height interactive iframe pointing to /courts
  var $container = $(wrapper).find('.layout-main-section');
  $container.empty();
  
  var $iframe = $('<iframe>', {
    src: '/courts',
    style: 'width: 100%; height: calc(100vh - 95px); min-height: 850px; border: none; display: block; border-radius: 8px;'
  });

  $container.append($iframe);
};
