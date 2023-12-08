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
            jumpHostUserName : $('#jump-host-username').val(),
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

    $('#connection-list').on('click', function(){
      $('#connection-section').show();
      $('#file-explorer-section').hide();
      cleanFileExplorerSection();
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
       let $connectBtn = $('<button>', {class:'btn btn-primary connect-btn'}).html('Connect');

       $tr.append($('<td>')
                            .append($editBtn)
                            .append($('<span>').html(' | '))
                            .append($deleteBtn)
                            .append($('<span>').html(' | '))
                            .append($connectBtn));
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

    $('.connect-btn').on('click', (e) => {
      const $tr = $(e.currentTarget).parent().parent();
      connectionId = $tr.data('id');
      connection = getConnection(connectionId);
      sendConnectionInfoToBackend(connection);
      
      $('#connection-section').hide();
      renderDataTable();
      $('#file-explorer-section').show();
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

  const cleanFileExplorerSection = () => {
    $('#table').DataTable().destroy();
  }

  const renderDataTable = () => {
 
    function enter(data) {
      console.log(data);
    }

    const data = [
      {
        path: '/asdasd/adasdad/',
        createdAt : 'asdadasd',
        desc: 'Hello world'
      },
      {
        path: '/asdasd/adasdad/dasdsad',
        createdAt : 'asdadasd',
        desc: 'Hello world 2'
      },
    ];

    const columns = [
      {
        data: 'path',
        title: 'Path'
      },
      {
        data: 'createdAt',
        title: 'Created At'
      },
      {
        data: 'desc',
        title: 'Description'
      },
      {
        data: "path", 
        title : "Action", 
        class: "all never action-btn",
        render: function(data) {
           return '<button class="btn btn-primary open-path" path='+data+'>Open</button>'
        },

        sortable : false
      },
    ];

    $('#table').DataTable({
          aaData: data,
          columns: columns
    });

    $('.open-path').on('click', function(e) {
      console.log($(e.currentTarget).attr('path'));
    });

  }

  const sendConnectionInfoToBackend = (connection) => {
    ipcRenderer.send('connect', connection);
  }