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
      'url': PNC_REST_BASE_URL + '/product/' + productId + '/version/' + versionId + '/project/' + projectId + '/configuration',
      'type': 'GET',
      'dataSrc': ''
    }, 
    'columns': [
      { 'data': 'id' },
      { 'data': 'identifier' },
      { 'data': 'buildScript' },
      { 'data': 'scmUrl' },
      { 'data': 'patchesUrl' },
      { 'data':
        function(json) {
          return '<button class="build btn btn-block btn-danger" value="' + json.id + '">Build</button>';
        }
      }
    ]
  });
  
  $('#configuration_content tbody').on( 'click', 'button.build', function (event) {
    event.preventDefault();
    $.post(PNC_REST_BASE_URL + 'configuration/' + $(this).attr('value') + '/build').
        done(function() {
          $('#configuration_content').prepend('<br/><div class="alert alert-success" role="alert">Build successfully triggered</div>');
          console.log('success');
        }).fail(function() {
          $('#configuration_content').prepend('<br/><div class="alert alert-danger" role="alert">Error attempting to trigger build</div>');
          console.log('failure');
        });
  });

  $('#configuration_content').on( 'click', 'button.addConfiguration', function (event) {
    event.preventDefault();
    $(location).attr('href',"configuration_add.html");
  });

  $('#configuration_content_add').on( 'click', 'button.cancelConfiguration', function (event) {
    event.preventDefault();
    $(location).attr('href',"configurations.html");
  });

  $('#configuration_content_add').on( 'click', 'button.saveConfiguration', function (event) {

       event.preventDefault();

       var identifier = $('#addConfIdentifier').val();
       var buildScript = $('#addConfBuildScript').val();
       var scmUrl = $('#addConfScmUrl').val();
       var patchesUrl = $('#addConfPatchesUrl').val();

       var JSONObj = {
            "identifier": identifier,
            "buildScript": buildScript,
            "scmUrl": scmUrl,
            "patchesUrl": patchesUrl
       };

       var data = JSON.stringify(JSONObj);
       console.log('Creating new build configuration: ' + data);

       $.ajax({
               url: PNC_REST_BASE_URL + 'product/' + productId + '/version/' + versionId + '/project/' + projectId + '/configuration',
               type: 'POST',
               dataType : 'json',
               data: data,
               contentType: "application/json; charset=utf-8",
               success: function(data) {
                  console.log('build configuration creation was successful');
               },
               failure: function(errMsg) {
                 console.log('build configuration creation was NOT successful: ' + errMsg);
               },
               complete: function(xhr, status) {
                  console.log('build configuration creation complete!!!!');
                  $(location).attr('href',"configurations.html");
               }
       });
  });

} );
