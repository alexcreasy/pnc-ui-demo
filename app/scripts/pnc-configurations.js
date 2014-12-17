// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage except productId,versionId and projectId
  var product = $.parseJSON(sessionStorage.getItem('product'));
  var version = $.parseJSON(sessionStorage.getItem('version'));
  var project = $.parseJSON(sessionStorage.getItem('project'));
  sessionStorage.clear();
  sessionStorage.setItem('product', JSON.stringify(product));
  sessionStorage.setItem('version', JSON.stringify(version));
  sessionStorage.setItem('project', JSON.stringify(project));

  $('#productInfoName').html(product.name);
  $('#productInfoDesc').html(product.description);
  $('#productInfoVersion').html(version.version);
  $('#projectInfoName').html(project.name);
  $('#projectInfoDesc').html(project.description);
  $('#projectInfoProjectUrl').html(project.projectUrl);
  $('#projectInfoIssueTrackerUrl').html(project.issueTrackerUrl);

  var prodTable = $('#configuration').dataTable( {
    stateSave: true,
    'ajax': {
      'url': PNC_REST_BASE_URL + '/product/' + product.id + '/version/' + version.id + '/project/' + project.id + '/configuration',
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
          if (json.creationTime == null) {
            return '';
          }
          return new Date(json.creationTime).toLocaleString();;
        }
      },
      { 'data': 
        function(json) {
          if (json.creationTime == null) {
            return '';
          }
          return new Date(json.lastModificationTime).toLocaleString();;
        } 
      },
      { 'data':
        function(json) {
          return '<button class="build btn btn-block btn-danger" data-configuration-id="' + json.id + '">Build</button>';
        }
      }
    ]
  });
  
  $('#configuration tbody').on( 'click', 'button.build', 
    function (event) {
      event.preventDefault();
      console.log('trigger build click registered');
      $.post(PNC_REST_BASE_URL + '/product/' + product.id + '/version/' + version.id + '/project/' + project.id +
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
               url: PNC_REST_BASE_URL + '/product/' + product.id + '/version/' + version.id + '/project/' + project.id + '/configuration',
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
