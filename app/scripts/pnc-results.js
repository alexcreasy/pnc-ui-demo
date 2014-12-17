// Initialize Datatables
$(document).ready(function() {

  // Clear all sessionStorage except productId,versionId and projectId
  var productId = sessionStorage.getItem('productId');
  var versionId = sessionStorage.getItem('versionId');
  var projectId = sessionStorage.getItem('projectId');
  var configurationId = sessionStorage.getItem('configurationId');
  sessionStorage.clear();
  sessionStorage.setItem('productId', productId);
  sessionStorage.setItem('versionId', versionId);
  sessionStorage.setItem('projectId', projectId);
  sessionStorage.setItem('configurationId', configurationId);

  var filteredResults = [];
  var buildConfigIdentifier = '';
  var buildConfigScript = '';

  $.when(
     $.ajax({
         url: PNC_REST_BASE_URL + '/result',
         method: "GET",
         success: function (data) {
           $.each(data, function(entryIndex, entry){
             if (entry['projectBuildConfigurationId'] == configurationId) {
                filteredResults.push(entry);
             }
           });
         },
         error: function (data) {
             console.log(JSON.stringify(data));
         }
     }),
     $.ajax({
         url: PNC_REST_BASE_URL + '/product/' + productId + '/version/' + versionId + '/project/' + projectId + '/configuration',
         method: "GET",
         success: function (data) {

           buildConfigIdentifier = data[0].identifier;
           buildConfigScript = data[0].buildScript;
         },
         error: function (data) {
             console.log(JSON.stringify(data));
         }
     })
  ).then( function(){
      loadDataTable(filteredResults);
  });

  function loadDataTable(filteredResults) {

     var prodTable = $('#results').dataTable( {
       stateSave: true,
       "aaData": filteredResults,
       "aoColumns": [
         { "data": "id" },
         { "data": "status" },
         { "data":
            function(json) {
              return '<div id="divLog"><h2>...</h2></div><button class="logs btn btn-default" value="' + json.id + '">View Logs</button>';
            }
         },
         { "data":
            function(json) {
              return buildConfigIdentifier;
            }
         },
         { "data":
            function(json) {
              return buildConfigScript;
            }
         }
       ]
     })
  };

  $('#results').on( 'click', 'button.logs', function (event) {
    event.preventDefault();
    var resultId = $(this).attr('value');
    $("#divLog").load(PNC_REST_BASE_URL + '/result/' + resultId + '/log', function(responseTxt,statusTxt,xhr){
        if (statusTxt == "success") {
          console.log("External log loaded successfully!");
        }
        if (statusTxt=="error") {
          console.log("Error: "+xhr.status+": "+xhr.statusText);
        }
    });
  });

} );
