// Initialize Datatables
$(document).ready(function() {

  // CONSTANT VALUES
  var MAX_POLLS = 200
  var POLL_INTERVAL = 10000 //ms

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

  var configurationsWithResults = [];

  $.when(
     $.ajax({
         url: PNC_REST_BASE_URL + '/result',
         method: "GET",
         success: function (data) {
           $.each(data, function(entryIndex, entry){
             if ($.inArray(entry['projectBuildConfigurationId'], configurationsWithResults) === -1) {
                configurationsWithResults.push(entry['projectBuildConfigurationId']);
             }
           });
         },
         error: function (data) {
             console.log(JSON.stringify(data));
         }
     })
  ).then( function(){
      $('#configuration').dataTable( {
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
              // Check if build is running       
              $.get(PNC_REST_BASE_URL + '/result/running/' + json.id)
                .fail(
                  // The HTTP request failed, we don't know if the build is running or not.
                  function(data, text, xhr) {
                    console.warn('Attempt to check if build is running failed: data={%O}, text={%O}, xhr={%O}', data, text, xhr)
                  }
                ).done(
                  function(data, text, xhr) {
                    console.log('Check if build is running : data={%O}, text={%O}, xhr={%O}', data, text, xhr);
                    if (xhr.status === 204) {
                      // Build IS NOT running
                      console.log('build {%O} is not running', json)
                    } else if (xhr.status === 200 && data.status === 'BUILDING') {
                      // Build IS running
                      postTriggerBuild(json.id, PNC_REST_BASE_URL + '/result/running/' + json.id);
                      console.log('build {%O} is running', json);
                    } else {
                      throw new Error('Unexpected outcome of HTTP request: xhr=' + xhr);
                    }
                  }
                );

              var btnBuild = '<button class="build btn btn-block btn-danger" id="btn-trigger-build-' + json.id + '" data-configuration-id="' + json.id + '">Build</button>';
              var btnResults = '<button class="results btn btn-block btn-default" value="' + json.id + '">View Results</button>';

              if (!($.inArray(json.id, configurationsWithResults) === -1)) {
                return btnBuild + btnResults;
              }
              return btnBuild;
           }
        }
        ]
     });
  });


  $('#configuration_content').on( 'click', 'button.results', function (event) {
    event.preventDefault();
    sessionStorage.setItem('configurationId', $(this).attr('value'));
    console.log('Stored in sessionStorage: configurationId ' + $(this).attr('value'));
    $(location).attr('href',"results.html");
  });

  /*
   *
   * Triggering a build
   *
   */

  $('#configuration_content').on( 'click', 'button.build', 
    function (event) {
      event.preventDefault();
      console.log('trigger build click registered');

      var configId = $(this).data("configuration-id");

      $.post(PNC_REST_BASE_URL + '/product/' + product.id + '/version/' + version.id + '/project/' + project.id + '/configuration/' + configId + '/build')
        .done(
          function(data, text, xhr) {
            $('#alert-space').prepend('<br/><div class="alert alert-success" role="alert">Build successfully triggered</div>');
            console.log('Trigger build successful: data={%O}, text={%O}, xhr={%O}', data, text, xhr);
            postTriggerBuild(configId, data);
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

  function postTriggerBuild(configId, pollUrl) {
    console.log('postTriggerBuild(configId=%d, pollUrl=%s)', configId, pollUrl);
    $('#btn-trigger-build-' + configId).parents('td').prepend(
      '<p><span id="in-progress-build-' + configId + '" class="spinner spinner-xs spinner-inline"></span> Building</p>');
    $('#btn-trigger-build-' + configId).remove();

    // poll counter
    var polls = 0;
    // Self executing polling function
    (function poll(){
      setTimeout(
        function(){
          console.log('SetTimeOutFunction()');
          $.ajax(
            { url: pollUrl, 
              complete: 
                function(data, textStatus) {
                  if (polls > MAX_POLLS) {
                    throw new Error('Maximum number of polls exceeded');
                  }

                  console.log('Poll #%d Result: data={%O}, textStatus{%O}', polls++, data, textStatus);

                  // Action the result of the poll
                  switch (data.status) {
                    case 200:
                      if (data.responseJSON.status === 'BUILDING') {
                        console.log('BUILD IN PROGRESS');
                        // Contiune polling
                        poll();
                      } else {
                        throw new Error('HTTP response 200 but JSON status other than BUILDING returned');
                      }
                      break;
                    case 204:
                      console.log('BUILD COMPLETED');
                      buildCompleted(configId, pollUrl);
                      break;
                    default:
                      throw new Error('Unrecognised HTTP response received: ' + data.responseJSON.status);
                  }
                } 
            }
          );
        }, 
        POLL_INTERVAL
      );
    })();
  }

  function buildCompleted(configId, pollUrl) {
    console.log('buildCompleted(configId=%d, pollUrl=%s)', configId, pollUrl);
    var parentTd = $('#in-progress-build-' + configId).parents('td');
    parentTd.html('<button class="build btn btn-block btn-danger" id="btn-trigger-build-' + configId + '" data-configuration-id="' + configId + '">Build</button><button class="results btn btn-block btn-default" value="' + configId + '">View Results</button>');
    $('#alert-space').html('<br/><div class="alert alert-info" role="alert">Build of configuration #' + configId + ' completed</div>');
  }


  /*
   *
   * Creating new configuration
   *
   */


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
