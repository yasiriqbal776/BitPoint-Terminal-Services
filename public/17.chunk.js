webpackJsonpac__name_([17],{

/***/ "./src/app/services/ServiceUrl.ts":
/***/ function(module, exports) {

"use strict";
"use strict";
var ServiceUrl = (function () {
    /*    public baseUrl:string = "http://localhost:5000/";*/
    /* public baseUrl: string = "http://104.199.49.55:3000/";*/
    function ServiceUrl() {
        this.baseUrl = "http://13.234.59.147:4000/";
    }
    ServiceUrl.prototype.getUrl = function () {
        return this.baseUrl;
    };
    return ServiceUrl;
}());
exports.ServiceUrl = ServiceUrl;


/***/ },

/***/ "./src/app/services/TransactionService.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var http_1 = __webpack_require__("./node_modules/@angular/http/index.js");
__webpack_require__("./node_modules/rxjs/add/operator/map.js");
var ServiceUrl_1 = __webpack_require__("./src/app/services/ServiceUrl.ts");
var TransactionService = (function () {
    function TransactionService(http) {
        this.http = http;
        this.urlService = new ServiceUrl_1.ServiceUrl();
    }
    TransactionService.prototype.getProfitStatisticsByTime = function (time) {
        var body = JSON.stringify({ "filterTime": time });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "merchant/getProfitStatisticsByTime", body, options)
            .map(function (res) { return res.json(); });
    };
    TransactionService.prototype.getTransactionStatisticsByTimeRoute = function (time) {
        var body = JSON.stringify({ "filterTime": time });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "merchant/getTransactionStatisticsByTimeRoute", body, options)
            .map(function (res) { return res.json(); });
    };
    TransactionService.prototype.getTransactionData = function (transactionId) {
        var body = JSON.stringify({ "transactionId": transactionId });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "merchant/getTransactionData", body, options)
            .map(function (res) { return res.json(); });
    };
    TransactionService.prototype.getProfitConfiguration = function (merchantProfit, bitpointProfit) {
        var body = JSON.stringify({ "merchantProfit": merchantProfit, "bitpointProfit": bitpointProfit });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "adminConfiguration/addProfitConfiguration", body, options)
            .map(function (res) { return res.json(); });
    };
    TransactionService.prototype.getTransactionDetailsById = function (merchantId) {
        var body = JSON.stringify({ "merchantId": merchantId });
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions({ method: 'post', headers: headers });
        return this.http.post(this.urlService.baseUrl + "merchant/getTransactionsByMerchantId", body, options)
            .map(function (res) { return res.json(); });
    };
    TransactionService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof http_1.Http !== 'undefined' && http_1.Http) === 'function' && _a) || Object])
    ], TransactionService);
    return TransactionService;
    var _a;
}());
exports.TransactionService = TransactionService;


/***/ },

/***/ "./src/app/transactions/transactions.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(jQuery) {"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var TransactionService_1 = __webpack_require__("./src/app/services/TransactionService.ts");
var Transactions = (function () {
    function Transactions(_transactionService, router) {
        this._transactionService = _transactionService;
        this.router = router;
        if (localStorage.getItem("merchantId") != null || localStorage.getItem("merchantId") != undefined) {
            this.merchantId = localStorage.getItem("merchantId");
            this.getMerchantById();
            localStorage.setItem("merchantId", "");
        }
    }
    Transactions.prototype.getTransactionDetailsForThisMerchant = function (elem) {
        console.log(localStorage.getItem("TransactionId"));
        localStorage.setItem("TransactionId", elem);
        this.router.navigate(["/app/dashboard"]);
    };
    Transactions.prototype.getMerchantById = function () {
        var _this = this;
        this.merchantId = jQuery.trim(this.merchantId);
        if (this.merchantId == undefined || this.merchantId.length == 0) {
            this.errordiv = true;
        }
        else {
            this.errordiv = false;
            this._transactionService.getTransactionDetailsById(this.merchantId).subscribe(function (a) {
                _this.merchantData = a.data;
                for (var i = 0; i < a.data.length; i++) {
                    var d = new Date(+_this.merchantData[i].transactionTime * 1000);
                    _this.merchantData[i].transactionTime = d;
                }
            });
        }
    };
    Transactions = __decorate([
        core_1.Component({
            selector: 'transactions',
            styles: [__webpack_require__("./src/app/transactions/transactions.style.scss")],
            template: __webpack_require__("./src/app/transactions/transactions.template.html"),
            providers: [TransactionService_1.TransactionService],
            encapsulation: core_1.ViewEncapsulation.None,
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof TransactionService_1.TransactionService !== 'undefined' && TransactionService_1.TransactionService) === 'function' && _a) || Object, (typeof (_b = typeof router_1.Router !== 'undefined' && router_1.Router) === 'function' && _b) || Object])
    ], Transactions);
    return Transactions;
    var _a, _b;
}());
exports.Transactions = Transactions;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/jquery/dist/jquery.js")))

/***/ },

/***/ "./src/app/transactions/transactions.module.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var common_1 = __webpack_require__("./node_modules/@angular/common/index.js");
var forms_1 = __webpack_require__("./node_modules/@angular/forms/index.js");
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var transactions_component_1 = __webpack_require__("./src/app/transactions/transactions.component.ts");
exports.routes = [
    { path: '', component: transactions_component_1.Transactions, pathMatch: 'full' }
];
var TransactionsModule = (function () {
    function TransactionsModule() {
    }
    TransactionsModule.routes = exports.routes;
    TransactionsModule = __decorate([
        core_1.NgModule({
            declarations: [
                transactions_component_1.Transactions
            ],
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule.forChild(exports.routes),
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], TransactionsModule);
    return TransactionsModule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionsModule;


/***/ },

/***/ "./src/app/transactions/transactions.style.scss":
/***/ function(module, exports) {

module.exports = "/***********************************/\n/**             Profitconfiguration     **/\n/***********************************/\n.subscriptionBox {\n  width: 58%;\n  margin: 0 auto;\n  position: relative;\n  height: 48px;\n  margin-top: 10px;\n  margin-bottom: 50px; }\n\n.input-wrapper {\n  position: absolute;\n  left: 0;\n  height: 100%;\n  top: 0;\n  width: 70%; }\n\n.btn-wrapper {\n  position: absolute;\n  left: 70%;\n  height: 100%;\n  top: 0;\n  width: 30%; }\n\n.btn-wrapper button, .input-wrapper input {\n  width: 100%;\n  height: 100%;\n  height: 100%; }\n\n.left-heading, .right-value {\n  position: relative;\n  float: left; }\n\n.right-value {\n  margin-left: 15px; }\n\n.left-heading p {\n  font-weight: bold; }\n\n.errosDiv {\n  width: 320px;\n  margin: 0 auto; }\n\n.input-wrapper input {\n  background: white;\n  padding-left: 15px;\n  border: none;\n  border-top-left-radius: 3px;\n  border-bottom-left-radius: 3px;\n  font-size: 17.5 !important;\n  font-family: 'Open Sans';\n  font-weight: 500; }\n\n.btn-wrapper button {\n  border: none;\n  background: #64bbe1;\n  color: white;\n  font-family: 'Open Sans';\n  border-radius: 4px;\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n  font-size: 24px; }\n\n.input-wrapper input::placeholder {\n  color: #aaaaaa;\n  font-style: italic;\n  font-size: 17.5 !important;\n  font-family: 'Open Sans';\n  font-weight: 500; }\n"

/***/ },

/***/ "./src/app/transactions/transactions.template.html":
/***/ function(module, exports) {

module.exports = "<ol class=\"breadcrumb\">\r\n    <li class=\"breadcrumb-item\">YOU ARE HERE</li>\r\n    <li class=\"breadcrumb-item active\">Transactions List</li>\r\n</ol>\r\n<h1 class=\"page-title\">Transactions <span class=\"fw-semi-bold\">List</span></h1>\r\n\r\n\r\n\r\n\t<div class=\"errosDiv\" *ngIf=\"errordiv\">Enter a merchant Id</div>\r\n\t\t  <div class=\"subscriptionBox clearfix\">\r\n\t\t\t\r\n\t\t\t\t<div class=\"input-wrapper\">\r\n\t\t\t\t\t<input type=\"text\" name=\"merchantId\" [(ngModel)]=\"merchantId\" class=\"custom-input\" placeholder=\"Enter merchant ID\">\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"btn-wrapper\">\r\n\t\t\t\t\t<button class=\"btn-subscribe\" (click)=\"getMerchantById()\" >Send</button>\r\n\t\t\t\t</div>\r\n\t</div>\r\n\r\n\r\n<section class=\"widget\" widget>\r\n    <div class=\"widget-body table-responsive\">\r\n        <table class=\"table merchantsTable\">\r\n            <thead>\r\n                <tr>\r\n                    <th class=\"hidden-xs-down\">#</th>\r\n                    <th>Merchant Id</th>\r\n                    <th>Customer Address</th>\r\n                    <th>Sending Amount</th>\r\n                    <th>Transaction Id</th>\r\n                    <th style=\"width:300px\" >Transaction Time</th>\r\n                </tr>\r\n            </thead>\r\n            <tbody>\r\n                <tr *ngFor=\"let merchant of merchantData; let i = index\">\r\n                    <td class=\"hidden-xs-down\">{{i + 1}}</td>\r\n                    <td>\r\n                        {{merchant.merchantId}}\r\n                    </td>\r\n                    <td>\r\n                        {{merchant.customerAddress}}\r\n                    </td>\r\n                    <td>\r\n                        {{merchant.sendingAmount}}\r\n                    </td>\r\n                    <td>\r\n                           <a  (click)=\"getTransactionDetailsForThisMerchant(merchant.transactionId)\"> {{merchant.transactionId}}</a>\r\n                    </td>\r\n                    <td style=\"width:300px\" >\r\n                    {{merchant.transactionTime}}\r\n                    </td>\r\n                    <!--<td class=\"width-150\">\r\n                        <button class=\"btn btn-primary app-btn\" (click) = \"deleteMerchant(merchant._id)\">Delete</button>\r\n                    </td>-->\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</section>"

/***/ }

});
//# sourceMappingURL=17.map