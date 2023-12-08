const { app, BrowserWindow,ipcMain, dialog } = require('electron');
const path = require('node:path');
const { Client } = require('ssh2');
const { readFileSync } = require('fs');

let mainWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    maximizable: false,
    webPreferences: {
        devTools: true,
        nodeIntegration: true,
        webviewTag: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js'),
    }
});

mainWindow.setMenuBarVisibility(false);
mainWindow.setResizable(false);
mainWindow.loadFile('index.html')

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});


ipcMain.on('connect', async (event, data) => {
  if(data.jumpHost) {
    executeActionOnJumpHostConnection(data, directoryListFetchHandler, errorHandler);
  } else {
    executeActionOnSingleHostConnection(data, directoryListFetchHandler, errorHandler)
  }
});

const errorHandler = (error) => {
  console.log(error);
  mainWindow.webContents.send('connectionError', {message: 'Connection Error'});
}

const directoryListFetchHandler = (sftp, path, conn, jumpConn) => {
  sftp.readdir(path, (err, list) => {
  
    if (err) {
      errorHandler(err);
      return;
    };
    conn.end();
    if(jumpConn) {
      jumpConn.end();
    }
    mainWindow.webContents.send('listDir', {data: list});
  });
}

const executeActionOnSingleHostConnection = (connection, action, errorHandler) => {

  const conn = new Client();

  let connectionConf = {
    host: connection.hostName,
    port: parseInt(connection.hostPort),
    username: connection.userName,
  };

  if (connection.password) {
    connectionConf.password = connection.password;
  } else {
    connectionConf.privateKey = readFileSync(connection.keyPath);
  }
  conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          console.log(err);
          errorHandler(err);
          return conn.end(); 
        }
        action(sftp, connection.path, conn);
      });
  }).connect(connectionConf);
};

const executeActionOnJumpHostConnection = (connection, action, errorHandler) => {
  let connectionConf = {
    host: connection.host,
    port: connection.port,
    username: connection.userName,
  };

  if (connection.password) {
    connectionConf.password = connection.password;
  } else {
    connectionConf.privateKey = readFileSync(connection.keyPath);
  }

  let connectionConf2 = {
    host: connection.jumpHost,
    port: connection.jumpPort,
    username: connection.jumpHostUserName,
  };
 
  const conn1 = new Client();
  const conn2 = new Client();

  conn1.on('ready', () => {
    conn1.forwardOut('127.0.0.1', 12345, connectionConf2.host, connectionConf2.port, (err, stream) => {
      if (err) {
        errorHandler(err);
        return conn1.end();
      }

      let conf = {
        sock: stream,
        username: connectionConf2.username,
      }

      if (connection.jumpHostPassword) {
        conf.password = connection.jumpHostPassword;
      } else {
        conf.privateKey = readFileSync(connection.jumpHostKeyPath);
      }

      conn2.connect(conf);
    });
  }).connect(connectionConf);
  
  conn2.on('ready', () => {  
    conn2.sftp((err, sftp) => {
      if(err) {
        errorHandler(err);
        return conn2.end();
      } else {
        action(sftp, connection.path, conn2, conn1);
      }
    });
  });
}
