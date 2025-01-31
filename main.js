// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')
const axios = require("axios");

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'accurate.ico')
  })

  mainWindow.loadURL('https://account.accurate.id/oauth/authorize?client_id=07fa8516-58e9-45ec-8ae5-9aeebce4bbdd&response_type=token&redirect_uri=https://devrid.github.io/auth-callback/&scope=bank_statement_view bank_statement_save bank_transfer_view bank_transfer_save bank_transfer_delete data_classification_view employee_payment_view employee_payment_save other_deposit_view other_deposit_save other_deposit_delete other_payment_view other_payment_save other_payment_delete expense_accrual_view expense_accrual_save expense_accrual_delete approval_view approval_save company_data comment_view comment_save attachment_view attachment_save contact_view department_view department_save department_delete project_view project_save project_delete payment_term_view payment_term_save payment_term_delete currency_view currency_save customer_view customer_save customer_delete customer_category_view customer_category_save customer_category_delete delivery_order_view delivery_order_save delivery_order_delete sales_invoice_view sales_invoice_save sales_invoice_delete salesman_commission_view salesman_commission_save sales_order_view sales_order_save sales_order_delete sales_quotation_view sales_quotation_save sales_quotation_delete exchange_invoice_view exchange_invoice_save exchange_invoice_delete sales_receipt_view sales_receipt_save sales_receipt_delete sales_return_view sales_return_save sales_return_delete glaccount_view glaccount_save glaccount_delete journal_voucher_view journal_voucher_save journal_voucher_delete shipment_view shipment_save shipment_delete tax_view tax_save tax_delete item_view item_save item_delete item_category_view item_category_save item_category_delete item_transfer_view item_transfer_save item_transfer_delete item_adjustment_view item_adjustment_save item_adjustment_delete stock_mutation_history_view job_order_view job_order_save job_order_delete material_adjustment_view material_adjustment_save material_adjustment_delete vendor_price_view vendor_price_save vendor_category_view vendor_category_save vendor_category_delete warehouse_view warehouse_save warehouse_delete purchase_invoice_view purchase_invoice_save purchase_invoice_delete purchase_order_view purchase_order_save purchase_order_delete purchase_payment_view purchase_payment_save purchase_payment_delete purchase_requisition_view purchase_requisition_save purchase_requisition_delete purchase_return_view purchase_return_save purchase_return_delete receive_item_view receive_item_save receive_item_delete vendor_view vendor_save vendor_delete fixed_asset_view fixed_asset_save fixed_asset_delete roll_over_view roll_over_save asset_transfer_view asset_transfer_save stock_opname_order_view stock_opname_order_save stock_opname_order_delete stock_opname_result_view stock_opname_result_save stock_opname_result_delete dashboard_view access_privilege_view access_privilege_save branch_view branch_save branch_delete employee_view employee_save employee_delete price_category_view price_category_save sellingprice_adjustment_view sellingprice_adjustment_save sellingprice_adjustment_delete fob_view fob_save fob_delete freeonboard_view freeonboard_save unit_view unit_save unit_delete auto_number_view auto_number_save auto_number_delete').then(() => {
    // Code
  });
  
  let cekClose = setInterval(() => {
    let accurateQuery   = mainWindow.webContents.getURL().split('#')[1],
        accurateParams  = new URLSearchParams(accurateQuery);
    // console.log(accurateQuery);
    // console.log(accurateParams.get('access_token'));
    // console.log('cek');

    // if(true) {
    //   mainWindow.loadFile('index.html').then(() => {
    //     mainWindow.send('authUser', JSON.stringify({
    //       email: '',
    //       token: 'de21dc87-2250-421b-8025-71538c522285',
    //       session: '09efd83d-5991-4ab4-bb28-0238fafc9663'
    //     }));
    //   })
    //   clearInterval(cekClose);
    // }
    
    if(accurateParams.get('access_token')) {
      let user = new URLSearchParams(accurateParams.get('user').replace(/, /g, '&'));

      mainWindow.loadFile('index.html').then(() => {
        let options = {
          method: 'GET',
          url: 'https://account.accurate.id/api/open-db.do',
          params: {id: '687716'},
          headers: {Authorization: 'Bearer '+accurateParams.get('access_token')}
        };
        
        axios.request(options).then(function (response) {
          console.log('auth user');
          console.log(user);
          console.log(response.data);
          mainWindow.send('authUser', JSON.stringify({
            email: user.get('email'),
            token: accurateParams.get('access_token'),
            session: response.data.session
          }));
        }).catch(function (error) {
          // console.error(error);
        });
      })
      clearInterval(cekClose);
    }
  }, 3000);

  mainWindow.setMenu()

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const Datastore = require('nedb');

const db = {
    login: new Datastore('login.db'),
    settingPrintInvoice: new Datastore('settingInvoice.db'),
    settingPrintPembayaran: new Datastore('settingPembayaran.db')
};

db.login.loadDatabase();
db.settingPrintInvoice.loadDatabase();
db.settingPrintPembayaran.loadDatabase();

db.login.find({}, function(err, data){
    // console.log(data);
    if(data.length == 0){
      db.login.insert({name: 'admin@gmail.com', password: '1234567'});
    }
});

ipcMain.on('ping', (event, data) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  // console.log(data)
  // Send reply to a renderer
  event.sender.send('ping-reply', 'pong')
})

ipcMain.on('get-login', (event, request) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  db.login.find({}, function(err, data){
    // console.log(data);
    // Send reply to a renderer
    event.sender.send('get-login-reply', JSON.stringify(data));
  });
})

ipcMain.on('login', (event, data) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  let dataObject = JSON.parse(data);
  // console.log(dataObject)
  db.login.remove({}, { multi: true }, function (err, numRemoved) {
    db.login.insert({name: dataObject.email, password: dataObject.password});
  });
  // Send reply to a renderer
  event.sender.send('login-reply', data)
})


// Setting Print Invoice
ipcMain.on('get-setting-print-invoice', (event, request) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  db.settingPrintInvoice.find({}, function(err, data){
    // console.log(data);
    // Send reply to a renderer
    event.sender.send('get-setting-print-invoice-reply', JSON.stringify(data));
  });
})

ipcMain.on('setting-print-invoice', (event, data) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  let dataObject = JSON.parse(data);
  // console.log(dataObject)
  db.settingPrintInvoice.remove({}, { multi: true }, function (err, numRemoved) {
    db.settingPrintInvoice.insert(dataObject);
  });
  // Send reply to a renderer
  event.sender.send('setting-print-invoice-reply', data)
})

// Setting Print Pembayaran
ipcMain.on('get-setting-print-pembayaran', (event, request) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  db.settingPrintPembayaran.find({}, function(err, data){
    // console.log(data);
    // Send reply to a renderer
    event.sender.send('get-setting-print-pembayaran-reply', JSON.stringify(data));
  });
})

ipcMain.on('setting-print-pembayaran', (event, data) => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  let dataObject = JSON.parse(data);
  // console.log(dataObject)
  db.settingPrintPembayaran.remove({}, { multi: true }, function (err, numRemoved) {
    db.settingPrintPembayaran.insert(dataObject);
  });
  // Send reply to a renderer
  event.sender.send('setting-print-pembayaran-reply', data)
})
