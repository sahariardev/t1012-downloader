const LOCAL_STORAGE_CACHE_KEY = 'connection';
const CURRENT_PATH_CACHE_KEY = 'currentPath';
const ACTIVE_CONNECTION_CACHE_KET = 'activeConnection'
      
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
            homePath: $('#home-path').val()
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
      connection.path = connection.homePath;
      sendConnectionInfoToBackend(connection);
      $('#connection-section').hide();
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
      $('#jump-host-username').val(connection.jumpHostUserName),
      $('#jump-host-password').val(connection.jumpHostPassword);
      $('#jump-host-key-path').val(connection.jumpHostKeyPath);
      $('#home-path').val(connection.homePath);
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
     $('#jump-host-username').val(''),
     $('#jump-host-password').val(''),
     $('#jump-host-key-path').val(''),
     $('#home-path').val('')
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
    if ( $.fn.DataTable.isDataTable( '#table' ) ) {
      $('#table').DataTable().destroy();  
    }
  }

  const renderDataTable = (data) => {
    cleanFileExplorerSection();

    const columns = [
      {
        data: 'name',
        title: 'Name'
      },
      {
        data: 'createdAt',
        title: 'Created At'
      },
      {
        data: "name", 
        title : "Action", 
        class: "all never action-btn",
        render: function(data, ignore, row) {
           if (row.type === 'FILE') {
            return '<button class="btn btn-primary download-file" path='+data+'>Download</button>'
           } else {
            return '<button class="btn btn-primary open-path" path='+data+'>Open</button>'
           }
        },

        sortable : false
      },
    ];

    $('#table').DataTable({
          aaData: data,
          columns: columns
    });

    $('.open-path').on('click', function(e) {
      const connection = getActiveConnection();
      connection.path = getCurrentPath() + '/' + $(e.currentTarget).attr('path');
      
      sendConnectionInfoToBackend(connection);
    });

  }

  const sendConnectionInfoToBackend = (connection) => {
    setCurrentPath(connection.path);
    setActiveConnection(connection);
    ipcRenderer.send('connect', connection);
  }

  ipcRenderer.on('listDir', function (event, response) {
    const data = response.data;

    let fileInfos = [];

    for (let fileInfo of data) {
      let fileInfoProcessedData = {
         name : fileInfo.filename,
         longname: fileInfo.longname,
         createdAt: new Date(fileInfo.attrs.atime * 1000),
         type: fileInfo.longname.charAt(0) == 'd' ? 'DIRECTORY' : 'FILE'
      }

      fileInfos.push(fileInfoProcessedData);
    }

  updateBreadCrumb();
  renderDataTable(fileInfos);
   $('#file-explorer-section').show();
});


const updateBreadCrumb = () => {
  const currentPath = getCurrentPath();

  const $breadcrumb = $('.breadcrumb');
  $breadcrumb.html('');
  let pathStr = '';

  for(let path of currentPath.split('/')) {
    const $li = $('<li>', {class : 'breadcrumb-item'});

    if(pathStr.at(-1) === '/') {
      pathStr += path;  
    } else {
      pathStr += '/' + path;
    }
    $li.append($('<a>', {class : 'bread-crumb-path'}).attr('path', pathStr).html(path.toUpperCase()));
    $breadcrumb.append($li);
  }

  $('.bread-crumb-path').on('click', function(e) {
    const connection = getActiveConnection();
    connection.path = $(e.currentTarget).attr('path');
      
      sendConnectionInfoToBackend(connection);
  });

}

const setCurrentPath = (path) => {
  localStorage.setItem(CURRENT_PATH_CACHE_KEY, path);
}

const getCurrentPath = () => {
  return localStorage.getItem(CURRENT_PATH_CACHE_KEY);
}

const setActiveConnection = (connection) => {
  localStorage.setItem(ACTIVE_CONNECTION_CACHE_KET, JSON.stringify(connection));
} 

const getActiveConnection = () => {
  return JSON.parse(localStorage.getItem(ACTIVE_CONNECTION_CACHE_KET));
}