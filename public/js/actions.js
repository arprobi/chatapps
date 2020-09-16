$(document).ready(function() {
    // show button
    $('#data-table tbody').on( 'click', '.btn-show', function () {
        var id      = $(this).data('id');
        var url     = window.location.href + '/show/' + id;
        return window.location.href = url;
    });

    // edit button

    // delete button
    $('#data-table tbody').on( 'click', '.btn-delete', function () {
        var id      = $(this).data('id');
        var url     = window.location.href + '/' + id + '/delete';
        swal({
            title: "Are you sure?",
            text: "You will archive this data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: url,
                    type: "GET"
                }).done(function(data) {
                    if(data.status) {
                        swal("Success! You have archived this data!", {
                            icon: "success",
                        }).then((res) => {
                            if(res){
                                location.reload();
                            }
                        });
                    } else {
                        swal("Oops! You failed to archive this data!", {
                            icon: "error",
                        });
                    }
                }).fail(function() {
                    swal("Oops! You failed to archive this data!", {
                        icon: "error",
                    });
                });
                
            } else {
                swal("Canceled to archive data!");
            }
        });
    });

    $('#data-table tbody').on( 'click', '.btn-edit', function () {
        var id      = $(this).data('id');
        var id      = $(this).data('id');
        var url     = window.location.href + '/' + id + '/edit';
        return window.location.href = url;
    });

    $('#data-table tbody').on( 'click', '.btn-setactive', function () {
        var id      = $(this).data('id');
        var status  = $(this).data('status');
        var url     = window.location.href + '/' + id + '/setactive';

        swal({
            title: `Are you sure want to set this to ${status}`,
            text: `You will set this data to ${status}!`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willset) => {
            if (willset) {
                $.ajax({
                    url: url,
                    type: "GET"
                }).done(function(data) {
                    if(data.status) {
                        swal(`Success! You have set to ${status}!`, {
                            icon: "success",
                        }).then((res) => {
                            if(res){
                                location.reload();
                            }
                        });
                    } else {
                        swal(`Oops! You failed to set ${status}!`, {
                            icon: "error",
                        });
                    }
                }).fail(function() {
                    swal(`Oops! You failed to set ${status}!`, {
                        icon: "error",
                    });
                });
                
            } else {
                swal(`Canceled to set ${status}!`);
            }
        });
    });
});