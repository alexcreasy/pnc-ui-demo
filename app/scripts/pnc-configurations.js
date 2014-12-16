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
      { 'data': 'creationTime' },
      { 'data': 'lastModificationTime' },
      { 'data':
        function(json) {
          console.log('button created');
          return '<button class="build btn btn-block btn-danger" data-configuration-id="' + json.id + '">Build</button>';
        }
      }
    ]
  });
  
  $('#configuration tbody').on( 'click', 'button.build', 
    function (event) {
      event.preventDefault();
      console.log('trigger build click registered');
      $.post(PNC_REST_BASE_URL + '/product/' + sessionStorage.getItem('productId') + '/version/' + 
             sessionStorage.getItem('versionId') + '/project/' + sessionStorage.getItem('projectId') + 
             '/configuration/' + $(this).data("configuration-id") + '/build')
        .done(
          function(data, text, xhr) {
            $('#alert-space').prepend('<br/><div class="alert alert-success" role="alert">Build successfully triggered</div>');
            console.log('Trigger build successful: data={%O}, text={%O}, xhr={%O}', data, text, xhr);
          }
        )
        .fail(
          function(data, text, xhr) {
            $('#alert-space').prepend('<br/><div class="alert alert-danger" role="alert">Error attempting to trigger build</div>');
            console.log('Trigger build failed: data={%O}, text={%O}, xhr={%O}', data, text, xhr);
          }
        );
    }
  );

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
               url: PNC_REST_BASE_URL + '/product/' + productId + '/version/' + versionId + '/project/' + projectId + '/configuration',
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
