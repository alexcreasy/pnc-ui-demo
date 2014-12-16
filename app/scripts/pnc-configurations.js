// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage except productId,versionId and projectId
  var productId = sessionStorage.getItem('productId');
  var versionId = sessionStorage.getItem('versionId');
  var projectId = sessionStorage.getItem('projectId');
  sessionStorage.clear();
  sessionStorage.setItem('productId', productId);
  sessionStorage.setItem('versionId', versionId);
  sessionStorage.setItem('projectId', projectId);

  var prodTable = $('#configuration').dataTable( {
    stateSave: true,
    'ajax': {
      'url': 'http://localhost:8080/pnc-web/rest/product/' + productId + '/version/' + versionId + '/project/' + projectId + '/configuration',
      'type': 'GET',
      'dataSrc': ''
    }, 
    'columns': [
      { 'data': 'id' },
      { 'data': 'identifier' },
      { 'data': 'buildScript' },
      { 'data': 'scmUrl' },
      { 'data': 'patchesUrl' },
      { 'data': 'creationTime' },
      { 'data': 'lastModificationTime' },                    
      { 'data':
        function(json) {
          return '<button class="build btn btn-block btn-danger" value="' + json.id + '">Build</button>';
        }
      }
    ]
  });
  
  $('#products tbody').on( 'click', 'button.build', function (event) {
    event.preventDefault();
    $.post(PNC_REST_BASE_URL + 'configuration/' + $(this).attr('value') + '/build').
        done(function() {
          $('#content').prepend('<br/><div class="alert alert-success" role="alert">Build successfully triggered</div>');
          console.log('success');
        }).fail(function() {
          $('#content').prepend('<br/><div class="alert alert-danger" role="alert">Error attempting to trigger build</div>');
          console.log('failure');
        });
  });
} );
