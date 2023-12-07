
window.rifat = 'Hello world';
window.$ = window.jQuery = require('./js/jquery-3.7.1.js'); 

const LOCAL_STORAGE_CACHE_KEY = 'connection';
      
$(function(){
    $('#submit-btn').on('click', function() {
      
        const connection = {
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
        
        saveConnection(connection);

    });
  });

  const getConnections = () => {
    const connectionStr = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY) || '[]';

    return JSON.parse(connectionStr);
  }

  const saveConnection = (connection) => {
    let connections = getConnections();
    connections.push(connection);
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(connections));
  }