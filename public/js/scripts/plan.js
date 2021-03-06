var table;
var id = 0;

var title_modal_data = " Agregar plan";
$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    //ListDatatable();
    catch_parameters();
    ListDatatable();
    SelectClients();
    SelectRoutines();
    DatePicker();
});

// datatable catalogos
function ListDatatable() {
    table = $('#table').DataTable({
        //dom: 'lfBrtip',
        dom: 'lfrtip',
        processing: true,
        serverSide: true,
        "paging": true,
        language: {
            "url": "/js/assets/Spanish.json"
        },
        ajax: {
            url: 'planes_dt'
        },
        columns: [{
            data: 'user.name'
        },
        {
            data: 'client.codigo'
        },
        {
            data: 'fecha_inicio'
        },
        {
            data: 'fecha_fin'
        },
        {
            data: 'hora_alarma'
        },
        {
            data: 'mensaje'
        },
        // { data: 'verificado'},
        {
            data: 'verificado',
            "render": function (data, type, row) {
                if (row.verificado === 'REALIZADO') {
                    return '<center><p class="border border-success text-success"><b>REALIZADO</b></p></center>';
                } else if (row.verificado === 'PENDIENTE') {
                    return '<center><p class="border border-warning text-warning"><b>PENDIENTE</b></p></center>';
                } else if (row.verificado === 'VENCIDO') {
                    return '<center><p class="border border-danger text-danger"><b>VENCIDO</b></p></center>';
                }
            }
        },
        {
            data: 'estado',
            "render": function (data, type, row) {
                if (row.estado === 'ACTIVO') {
                    return '<center><p class="bg-success text-white"><b>ACTIVO</b></p></center>';
                } else if (row.estado === 'INACTIVO') {
                    return '<center><p class="bg-warning text-white"><b>INACTIVO</b></p></center>';
                } else if (row.estado === 'ELIMINADO') {
                    return '<center><p class="bg-danger text-white"><b>ELIMINADO</b></p></center>';
                }
            }
        },
        { data: 'Editar', orderable: false, searchable: false },
        { data: 'Eliminar', orderable: false, searchable: false },
        ],
        buttons: [{
            text: '<i class="icon-eye"></i> ',
            className: 'rounded btn-dark m-2',
            titleAttr: 'Columnas',
            extend: 'colvis'
        },
        {
            text: '<i class="icon-download"></i><i class="icon-file-excel"></i>',
            className: 'rounded btn-dark m-2',
            titleAttr: 'Excel',
            extend: 'excel',
            exportOptions: {
                columns: [0, 1, 2]
            }
        },
        {
            text: '<i class="icon-download"></i><i class="icon-file-pdf"></i> ',
            className: 'rounded btn-dark m-2',
            titleAttr: 'PDF',
            extend: 'pdf',
            exportOptions: {
                columns: [0, 1, 2]
            }
        },
        {
            text: '<i class="icon-download"></i><i class="icon-print"></i> ',
            className: 'rounded btn-dark m-2',
            titleAttr: 'Imprimir',
            extend: 'print',
            exportOptions: {
                columns: [0, 1, 2]
            }
        },
        //btn Refresh
        {
            text: '<i class="icon-arrows-cw"></i>',
            className: 'rounded btn-info m-2',
            action: function () {
                table.ajax.reload();
            }
        }
        ],
    });
};

// guarda los datos nuevos
function Save() {
    $.ajax({
        url: "planes",
        method: 'post',
        data: catch_parameters(),
        success: function (result) {
            if (result.success) {
                toastr.success(result.msg);
                //console.log(result.plan_id);
                save_ejecutions(result.plan_id, result.client_id, result.fecha_inicio, result.fecha_fin);

            } else {
                toastr.warning(result.msg);
            }
        },
        error: function (result) {
            console.log(result.responseJSON.message);
            toastr.error("CONTACTE A SU PROVEEDOR POR FAVOR.");
        },
    });
    table.ajax.reload();
}

// captura los datos
function Edit(id) {

    //console.log(id);
    $.ajax({
        url: "planes/{plane}/edit",
        method: 'get',
        data: {
            id: id
        },
        success: function (result) {
            show_data(result);
        },
        error: function (result) {
            toastr.error(result + ' CONTACTE A SU PROVEEDOR POR FAVOR.');

            console.log(result);
        },

    });
};
/// muestra la vista con los datos capturados
var data_old;

function show_data(obj) {
    //ClearInputs();
    //console.log(obj);
    obj = JSON.parse(obj);
    id = obj.id;
    $("#mensaje2").val(obj.mensaje);
    $("#hora_alarma2").val(obj.hora_alarma);
    /*$("user_id").val(obj.user_id);
    $("client_id").val(obj.client_id);
    $("routine_id").val(obj.routine_id);
    $("fecha_inicio").val(obj.fecha_inicio);
    $("fecha_fin").val(obj.fecha_fin);
    $("hora_alarma").val(obj.hora_alarma);
    $("mensaje").val(obj.mensaje);*/
    if (obj.estado == "ACTIVO") {
        $('#estado2_activo').prop('checked', true);
    }
    if (obj.estado == "INACTIVO") {
        $('#estado2_inactivo').prop('checked', true);
    }
    $("#title-modal2").html("Editar datos");

    //data_old = $(".form-data2").serialize();

    $('#modal_datos2').modal('show');
};

$("#btn-actualizar-estado").click(function () {



    var data_new = $(".form-data2").serialize();
    data_new += "&id=" + id;
    //console.log(data_new);

    //console.log($('#estado2_activo').val());
    //console.log($('#estado2_inactivo').val());
    //console.log($('input[name="estado2"]').val());

    $.ajax({
        url: "planes/{plane}",
        method: 'put',
        data: data_new,
        success: function (result) {
            if (result.success) {
                toastr.success(result.msg);
                table.ajax.reload();
                $('#modal_datos2').modal('hide');

            } else {
                toastr.warning(result.msg);
            }
        },
        error: function (result) {
            console.log(result.responseJSON.message);
            toastr.error("CONTACTE A SU PROVEEDOR POR FAVOR.");
        },
    });

});


// actualiza los datos
function Update() {


    //var data_new = $(".form-data2").serialize();

    //console.log(data_new);

    /*if (data_old != data_new) {
        $.ajax({
            url: "planes/{plane}",
            method: 'put',
            data: { estado: $('#estado2_activo').val() },
            success: function (result) {
                if (result.success) {
                    toastr.success(result.msg);

                } else {
                    toastr.warning(result.msg);
                }
            },
            error: function (result) {
                console.log(result.responseJSON.message);
                toastr.error("CONTACTE A SU PROVEEDOR POR FAVOR.");
            },
        });
        table.ajax.reload();

    }*/
}


//funcion para eliminar valor seleccionado
function Delete(id_) {
    id = id_;
    $('#modal_eliminar').modal('show');
}
$("#btn_delete").click(function () {
    $.ajax({
        url: "planes/{plane}",
        method: 'delete',
        data: {
            id: id
        },
        success: function (result) {
            if (result.success) {
                toastr.success(result.msg);
            } else {
                toastr.warning(result.msg);
            }
        },
        error: function (result) {
            toastr.error(result.msg + ' CONTACTE A SU PROVEEDOR POR FAVOR.');
            console.log(result);
        },

    });
    table.ajax.reload();
    $('#modal_eliminar').modal('hide');
});









//////////////////////////////////////////////

// METODOS NECESARIOS
// funcion para volver mayusculas
function Mayus(e) {
    e.value = e.value.toUpperCase();
}

// obtiene los datos del formulario
function catch_parameters() {
    var data = $(".form-data").serialize();
    data += "&user_id=" + user_id;
    data += "&id=" + id;
    //console.log(data);
    return data;

}

// muestra el modal
$("#btn-agregar").click(function () {
    console.log("arrived");
    ClearInputs();
    $("#title-modal").html(title_modal_data);
    $("#modal_datos").modal("show");
});

// metodo de bootstrap para validar campos

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('form-data');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    event.preventDefault();
                    event.stopPropagation();
                    if (id == 0) {
                        Save();
                    } else {
                        Update();
                    }
                    $('#modal_datos').modal('hide');
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

/// limpi campos despues de utilizar el modal
function ClearInputs() {
    var forms = document.getElementsByClassName('form-data');
    Array.prototype.filter.call(forms, function (form) {
        form.classList.remove('was-validated');
    });
    //__Clean values of inputs
    $("#form-data")[0].reset();
    id = 0;
};

function SelectClients() {
    $.ajax({
        url: "list_clients",
        method: 'get',
        success: function (result) {
            var code = '<div class="form-group">';
            code += '<label><b>Clientes:</b></label>';
            code += '<select class="form-control" name="client_id" id="client_id" required>';
            code += '<option disabled value="" selected>(Seleccionar)</option>';
            $.each(result, function (key, value) {
                code += '<option value="' + value.id + '">' + value.codigo + ' ' + value.name + '</option>';
            });
            code += '</select>';
            code += '<div class="invalid-feedback">';
            code += 'Dato necesario.';
            code += '</div>';
            code += '</div>';
            $("#select_client").html(code);
        },
        error: function (result) {

            toastr.error(result.msg + ' CONTACTE A SU PROVEEDOR POR FAVOR.');
            console.log(result);
        },

    });
}

function SelectRoutines() {
    $.ajax({
        url: "list_routines",
        method: 'get',
        success: function (result) {
            var code = '<div class="form-group">';
            code += '<label><b>Planes disponibles:</b></label>';
            code += '<select class="form-control" name="routine_id" id="routine_id" required>';
            code += '<option disabled value="" selected>(Seleccionar)</option>';
            $.each(result, function (key, value) {
                code += '<option value="' + value.id + '">' + value.nombre + '</option>';
            });
            code += '</select>';
            code += '<div class="invalid-feedback">';
            code += 'Dato necesario.';
            code += '</div>';
            code += '</div>';
            $("#select_routine").html(code);
        },
        error: function (result) {

            toastr.error(result.msg + ' CONTACTE A SU PROVEEDOR POR FAVOR.');
            console.log(result);
        },

    });
}

//fecha de entrada
function DatePicker() {
    $('#datetimepicker1').datetimepicker({
        format: 'YYYY-MM-DD'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'YYYY-MM-DD',
        useCurrent: false
    });
    $("#datetimepicker1").on("change.datetimepicker", function (e) {
        $('#datetimepicker2').datetimepicker('minDate', e.date);
    });
    $("#datetimepicker2").on("change.datetimepicker", function (e) {
        $('#datetimepicker1').datetimepicker('maxDate', e.date);
    });

    $('#datetimepicker3').datetimepicker({
        format: 'LT'
    });

    
    $('#datetimepicker4').datetimepicker({
        format: 'LT'
    });
}


function save_ejecutions(plan_id, client_id, start, end) {
    console.log('llegando');
    var startDate = new Date(start); //YYYY-MM-DD
    var endDate = new Date(end); //YYYY-MM-DD
    // console.log(start, end);
    // console.log(startDate, endDate);
    //endDate.setDate(endDate.getDate() + 1);
    var getDateArray = function (start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            arr.push(new Date(dt));
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    var dateArr = getDateArray(startDate, endDate);
    for (var i = 0; i < dateArr.length; i++) {
        // console.log(dateArr[i]);

        console.log(dateArr[i].toISOString().slice(0, 10));

        //Creando Ejecuciones

        var data = {
            'plan_id': plan_id,
            'client_id': client_id,
            'fecha': dateArr[i].toISOString().slice(0, 10),
            'verificado': 'PENDIENTE',
            'estado': 'ACTIVO'

        };

        $.ajax({
            url: "save_ejecutions",
            method: 'post',
            data: data,
            success: function (result) {
                if (result.success) {
                    //toastr.success(result.msg);
                    //console.log(result);
                } else {
                    toastr.warning(result.msg);
                }
            },
            error: function (result) {
                console.log(result.responseJSON.message);
                toastr.error("CONTACTE A SU PROVEEDOR POR FAVOR.");
            },
        });
    }
}
