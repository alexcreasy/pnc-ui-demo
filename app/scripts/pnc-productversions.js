// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage except productId
  var productId = sessionStorage.getItem('productId');
  sessionStorage.clear();
  sessionStorage.setItem('productId', productId);
  
  var prodTable = $('#productversion').dataTable( {
    stateSave: true,
    'ajax': {
      'url': PNC_REST_BASE_URL + '/product/' + productId + '/version',
      'type': 'GET',
      'dataSrc': ''
    }, 
    'columns': [
      { 'data': 'id' },
      { 'data': 'version' },
      { 'data':
        function(json) {
          return '<button class="projects btn btn-default" value="' + json.id + '">View Projects</button>';
        }
      }
    ]
  });
  
  $('#productversion tbody').on( 'click', 'button.projects', function (event) {
    event.preventDefault();
    sessionStorage.setItem("versionId", $(this).attr('value'));
    console.log('Stored in sessionStorage: versionId ' + $(this).attr('value'));
    
    $(location).attr('href',"project.html");
  });
} );
