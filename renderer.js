
window.rifat = 'Hello world';
window.$ = window.jQuery = require('./js/jquery-3.7.1.js'); 

const LOCAL_STORAGE_CACHE_KEY = 'connection';
      
$(function(){
    renderConnectionList();

    $('#submit-btn').on('click', function() {
      let id =  $('#connection-id').val();

      const action = id ? 'EDIT' : 'CREATE';
      
      if (action === 'CREATE') {
        id = Math.random().toString(16).slice(2);
      }

        const connection = {
            id: id,
            name : $('#connection-name').val(),
            hostName : $('#host-name').val(),
            hostPort : $('#host-port').val(),
            userName: $('#user-name').val(),
            password: $('#password').val(),
            keyPath : $('#key-path').val(),
            jumpHost : $('#jump-host').val(),
            jumpPort: $('#jump-port').val(),
            jumpHostPassword: $('#jump-host-password').val(),
            jumpHostKeyPath: $('#jump-host-key-path').val(),
            jumpHostHomePath: $('#jump-host-home-path').val()
        };
        
        if (action === 'EDIT') {
          removeConnection(id);
        }

        saveConnection(connection);
        cleanConnectionModal();
        renderConnectionList();

        $('#modal-close-btn').trigger('click');
    });
  });

  const renderConnectionList = () => {

    const $table = $('#connection-table-body');
    $table.html('');
    const connections = getConnections();
    
    let count = 0;

    for (const connection of connections) {
       count ++;
       let $tr = $('<tr>');
       $tr.data('id', connection.id);
       $tr.append($('<th>').html(count));
       $tr.append($('<td>').html(connection.name));
       $tr.append($('<td>').html(connection.hostName));
       
       let $editBtn = $('<button>', {class:'btn btn-primary edit-btn'}).html('Edit');
       let $deleteBtn = $('<button>', {class:'btn btn-primary delete-btn'}).html('Delete');

       $tr.append($('<td>').append($editBtn).append($('<span>').html('|')).append($deleteBtn));
       $table.append($tr);
    }

    $('.delete-btn').on('click', (e) => {
      const $tr = $(e.currentTarget).parent().parent();
      removeConnection($tr.data('id'))
      $tr.remove();
    });

    $('.edit-btn').on('click', (e) => {
      const $tr = $(e.currentTarget).parent().parent();
      connectionId = $tr.data('id');
      connection = getConnection(connectionId);
      populateConnectionOnUi(connection);
      $('.add-new-connection-btn').trigger('click');
    });
  };

  const populateConnectionOnUi = (connection) => {
      $('#connection-id').val(connection.id);
      $('#connection-name').val(connection.name);
      $('#host-name').val(connection.hostName);
      $('#host-port').val(connection.hostPort);
      $('#user-name').val(connection.userName);
      $('#password').val(connection.password);
      $('#key-path').val(connection.keyPath);
      $('#jump-host').val(connection.jumpHost);
      $('#jump-port').val(connection.jumpPort);
      $('#jump-host-password').val(connection.jumpHostPassword);
      $('#jump-host-key-path').val(connection.jumpHostKeyPath);
      $('#jump-host-home-path').val(connection.jumpHostHomePath);
  }

  const cleanConnectionModal = () => {
    $('#connection-id').val('');
     $('#connection-name').val(''),
     $('#host-name').val(''),
     $('#host-port').val(''),
     $('#user-name').val(''),
     $('#password').val(''),
     $('#key-path').val(''),
     $('#jump-host').val(''),
     $('#jump-port').val(''),
     $('#jump-host-password').val(''),
     $('#jump-host-key-path').val(''),
     $('#jump-host-home-path').val('')
 }

  const getConnections = () => {
    const connectionStr = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY) || '[]';

    return JSON.parse(connectionStr);
  }

  const saveConnection = (connection) => {
    let connections = getConnections();
    connections.push(connection);
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(connections));
  }

  const removeConnection = (id) => {
    let connections = getConnections();
    connections = connections.filter((conn) => conn.id != id);
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(connections));
  }

  const getConnection = (id) => {
     const connections = getConnections().filter((conn) => conn.id === id);

     if (connections.length > 0 ) {
      
      return connections[0];

     } else {
      return {};
     }
  }