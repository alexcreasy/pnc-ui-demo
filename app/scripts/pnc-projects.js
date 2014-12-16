// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage except productId and versionId
  var productId = sessionStorage.getItem('productId');
  var versionId = sessionStorage.getItem('versionId');  
  sessionStorage.clear();
  sessionStorage.setItem('productId', productId);
  sessionStorage.setItem('versionId', versionId);  
  
  var prodTable = $('#projects').dataTable( {
    stateSave: true,
    'ajax': {
      'url': PNC_REST_BASE_URL + '/product/' + productId + '/version/' + versionId + '/project',
      'type': 'GET',
      'dataSrc': ''
    }, 
    'columns': [
      { 'data': 'id' },
      { 'data': 'name' },
      { 'data': 'description' },
      { 'data': 'issueTrackerUrl' },
      { 'data': 'projectUrl' },            
      { 'data':
        function(json) {
          return '<button class="configurations btn btn-default" value="' + json.id + '">View Configurations</button>';
        }
      }
    ]
  });
  
  $('#projects tbody').on( 'click', 'button.configurations', function (event) {
    event.preventDefault();
    sessionStorage.setItem("projectId", $(this).attr('value'));
    console.log('Stored in sessionStorage: projectId ' + $(this).attr('value'));
    
    $(location).attr('href',"configurations.html");
  });

} );
