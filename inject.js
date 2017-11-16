const {remote, ipcRenderer} = require('electron');
const {Tray, Menu, app} = remote;

const ipcMain = ipcRenderer;

const mainWindow = remote.getCurrentWindow();

window.onbeforeunload = (e) => {
  mainWindow.hide();
  e.returnValue = false
}

ipcRenderer.on('params', (event, message) => {
    const options = JSON.parse(message);
    const path = remote.require('path');
    const iconPath = path.join(__dirname, '../', '/icon.png');
    const appIcon = new Tray(iconPath);

    const onClick = () => {
      if (mainWindow.isVisible()) {
        if (mainWindow.isFocused()) {
            mainWindow.hide();
        } else {
            mainWindow.focus();
        }
      } else {
        mainWindow.show();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      {
        label: options.name,
        click: onClick,
      },
      {
        label: 'Quit',
        click: app.exit,
      },
    ]);

    appIcon.on('click', onClick);

    mainWindow.on('show', () => {
      appIcon.setHighlightMode('always');
    });

    mainWindow.on('hide', () => {
      appIcon.setHighlightMode('never');
    });

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const itemCountRegex = /[([{](\d*?)\+?[}\])]/;
        const match = itemCountRegex.exec(title);
        if (match) {
          appIcon.setToolTip(`(${match[1]})  ${options.name}`);
        } else {
          appIcon.setToolTip(options.name);
        }
      });
    } else {
      ipcMain.on('notification', () => {
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
      });

      mainWindow.on('focus', () => {
        appIcon.setToolTip(options.name);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);
});
