// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage
  sessionStorage.clear();

  var prodTable = $('#products').dataTable( {
    "bAutoWidth": false,
    stateSave: true,
    'ajax': {
      'url': 'http://localhost:8080/pnc-web/rest/product',
      'type': 'GET',
      'dataSrc': ''
    }, 
    'columns': [
      { 'data': 'id' },
      { 'data': 'name' },
      { 'data': 'description' },
      { 'data':
        function(json) {
          return '<button class="versions btn btn-default" value="' + json.id + '">View Versions</button>';
        }
      }
    ]
  });

  $('#products tbody').on( 'click', 'button.versions', function (event) {
    event.preventDefault();
    sessionStorage.setItem("productId", $(this).attr('value'));
    console.log('Stored in sessionStorage: productId ' + $(this).attr('value'));

    $(location).attr('href',"productversions.html");
  });

} );
