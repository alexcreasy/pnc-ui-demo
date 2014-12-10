var newPncClient = function (baseUrl) {
    this.startBuild = function (request) { 
        $.ajax({
            url: PNC_REST_BASE_URL + '/configuration/' + request.id + '/build',
            type: 'POST',
            dataType : 'json',
            success: function(json) {
                console.log('startBuild() for "' + request + '" was sucessful');
                if (request.success !== undefined) {
                    request.success(json);     
                }
            }   
            error: function(xhr, status, errorThrown) {
                console.log('startBuild() for "' + request + '" failed');
                console.log('Error: ' + errorThrown);
                console.log('Status: ' + status);
                console.dir(xhr);
                if (request.error !== undefined) {
                    request.error(xhr, status, errorThrown);
                }
            }
            complete: function(xhr, status) {
                if (request.complete !== undefined) {
                    request.complete(xhr, status);
                }
            }
        });
    }
}