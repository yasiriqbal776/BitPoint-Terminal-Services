webpackJsonpac__name_([18],{

/***/ "./src/app/profitconfiguration/Profitconfiguration.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var TransactionService_1 = __webpack_require__("./src/app/services/TransactionService.ts");
var Profitconfiguration = (function () {
    function Profitconfiguration(_transactionService, router) {
        this._transactionService = _transactionService;
        this.successalert = false;
        this.failurealert = false;
        this.router = router;
        /*  if(localStorage.getItem("userLocal")==null){
              this.router.navigate(["/login"]);
            }else{
               
            }*/
    }
    Profitconfiguration.prototype.getProfits = function () {
        var _this = this;
        this.successalert = false;
        this.failurealert = false;
        var error;
        if (this.bitpointProfit == undefined) {
            return false;
        }
        if (this.bitpointProfit == undefined) {
            return false;
        }
        var addition = parseFloat(this.bitpointProfit) + parseFloat(this.merchantProfit);
        if (addition > 100 || addition < 100) {
            error = true;
            this.failurealert = true;
            console.log(addition);
        }
        else {
            this.failurealert = false;
            error = false;
        }
        if (error) {
        }
        else {
            this._transactionService.getProfitConfiguration(this.merchantProfit, this.bitpointProfit).subscribe(function (a) {
                console.log(a);
                if (a.code == 200) {
                    _this.successalert = true;
                    _this.bitpointProfit = undefined;
                    _this.merchantProfit = undefined;
                    _this.failurealert = false;
                }
                else {
                    _this.successalert = false;
                }
            });
        }
    };
    Profitconfiguration = __decorate([
        core_1.Component({
            selector: 'Profitconfiguration',
            styles: [__webpack_require__("./src/app/profitconfiguration/profitconfiguration.style.scss")],
            template: __webpack_require__("./src/app/profitconfiguration/profitconfiguration.template.html"),
            providers: [TransactionService_1.TransactionService],
            encapsulation: core_1.ViewEncapsulation.None,
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof TransactionService_1.TransactionService !== 'undefined' && TransactionService_1.TransactionService) === 'function' && _a) || Object, (typeof (_b = typeof router_1.Router !== 'undefined' && router_1.Router) === 'function' && _b) || Object])
    ], Profitconfiguration);
    return Profitconfiguration;
    var _a, _b;
}());
exports.Profitconfiguration = Profitconfiguration;


/***/ },

/***/ "./src/app/profitconfiguration/profitconfiguration.module.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var common_1 = __webpack_require__("./node_modules/@angular/common/index.js");
var forms_1 = __webpack_require__("./node_modules/@angular/forms/index.js");
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var Profitconfiguration_component_1 = __webpack_require__("./src/app/profitconfiguration/Profitconfiguration.component.ts");
exports.routes = [
    { path: '', component: Profitconfiguration_component_1.Profitconfiguration, pathMatch: 'full' }
];
var LoginModule = (function () {
    function LoginModule() {
    }
    LoginModule.routes = exports.routes;
    LoginModule = __decorate([
        core_1.NgModule({
            declarations: [
                Profitconfiguration_component_1.Profitconfiguration
            ],
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule.forChild(exports.routes),
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], LoginModule);
    return LoginModule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginModule;


/***/ },

/***/ "./src/app/profitconfiguration/profitconfiguration.style.scss":
/***/ function(module, exports) {

module.exports = "/***********************************/\n/**             Profitconfiguration     **/\n/***********************************/\n.centered-div {\n  min-width: 800px;\n  margin: 25px auto; }\n\n.myinputs {\n  border: none;\n  padding-left: 15px;\n  height: 40px;\n  border: 1px solid #ccc;\n  width: 100%; }\n\n.getProfit {\n  width: 70%;\n  height: 40px;\n  line-height: 40px;\n  background: #EBC41D;\n  color: #0D192C;\n  border: none;\n  font-size: 18px;\n  font-weight: bold; }\n\n.successalert {\n  width: 392px;\n  margin: 25px auto; }\n\n.failurealert {\n  width: 392px;\n  margin: 25px auto; }\n\n.centered-div h3 {\n  font-size: 22px;\n  font-weight: 500;\n  text-align: center;\n  margin: 35px; }\n"

/***/ },

/***/ "./src/app/profitconfiguration/profitconfiguration.template.html":
/***/ function(module, exports) {

module.exports = "\r\n\r\n<div class=\"centered-div\">\r\n\r\n    <h3>Calculate profit</h3>\r\n\r\n    <div class=\"row\">\r\n\r\n        <div class=\"col-md-4\">\r\n            <input type=\"text\" class=\"myinputs\" name=\"merchantProfit\" [(ngModel)]=\"merchantProfit\" placeholder=\"Enter Merchant Profit\">\r\n        </div>\r\n\r\n         <div class=\"col-md-4\">\r\n            <input type=\"text\" class=\"myinputs\"  name=\"bitpointProfit\" [(ngModel)]=\"bitpointProfit\" placeholder=\"Enter Bitpoint Profit\">\r\n        </div>\r\n\r\n        <div class=\"col-md-4\">\r\n            <button class=\"getProfit\" (click)=\"getProfits()\">Get Profits</button>\r\n        </div>\r\n\r\n\r\n    </div>\r\n\r\n    <div class=\"alert alert-success successalert\" *ngIf=\"successalert\">\r\n      Your information was successfully recived!\r\n    </div>\r\n    \r\n     <div class=\"alert alert-danger failurealert\" *ngIf=\"failurealert\">\r\n      Both amounts should add upto 100\r\n    </div>\r\n\r\n\r\n\r\n</div>"

/***/ },

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


/***/ }

});
//# sourceMappingURL=18.map